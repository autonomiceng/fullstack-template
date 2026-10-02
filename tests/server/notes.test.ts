import { afterAll, beforeEach, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportOpenApi } from "../../scripts/openapi";
import { createApp } from "../../src/server/app";
import { createDatabase } from "../../src/server/db/connection";
import { notes } from "../../src/server/db/schema";

const url = process.env.TEST_DATABASE_URL;
if (!url)
  throw new Error("TEST_DATABASE_URL must identify the isolated test database");
const database = createDatabase(url);
const app = createApp({ db: database.db });

beforeEach(async () => {
  await database.db.execute(sql`TRUNCATE TABLE notes`);
});
afterAll(async () => {
  try {
    await database.db.execute(sql`TRUNCATE TABLE notes`);
  } finally {
    await database.close();
  }
});

function request(path = "/api/notes", body?: unknown) {
  return new Request(
    `http://localhost${path}`,
    body === undefined
      ? undefined
      : {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
  );
}

test("an empty database returns an empty list and unknown API paths stay JSON 404s", async () => {
  const response = await app.handle(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([]);

  const assetsDir = await mkdtemp(join(tmpdir(), "notes-assets-"));
  try {
    await writeFile(
      join(assetsDir, "index.html"),
      "<!doctype html><title>Notes</title>",
    );
    const withAssets = createApp({ db: database.db, assetsDir });
    await withAssets.modules;
    for (const path of ["/api", "/api/missing"]) {
      const missing = await withAssets.handle(request(path));
      expect(missing.status).toBe(404);
      expect(await missing.json()).toEqual({
        error: { code: "NOT_FOUND", message: "Route not found." },
      });
    }
    expect(await (await withAssets.handle(request("/notes"))).text()).toContain(
      "<title>Notes</title>",
    );
  } finally {
    await rm(assetsDir, { recursive: true, force: true });
  }
});

test("create persists a trimmed title and UTC timestamp across a fresh connection", async () => {
  const writer = createDatabase(url);
  let created;
  try {
    const response = await createApp({ db: writer.db }).handle(
      request("/api/notes", { title: "  Synthetic note  " }),
    );
    expect(response.status).toBe(201);
    created = await response.json();
    expect(created.title).toBe("Synthetic note");
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
  } finally {
    await writer.close();
  }
  const reader = createDatabase(url);
  try {
    const response = await createApp({ db: reader.db }).handle(request());
    expect(await response.json()).toEqual([created]);
  } finally {
    await reader.close();
  }
});

test("invalid raw titles have the same sanitized errors in development and production", async () => {
  for (const environment of ["development", "production"]) {
    const child = Bun.spawn([process.execPath, "tests/server/validation.ts"], {
      env: { ...process.env, NODE_ENV: environment },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
    expect(JSON.parse(stdout)).toEqual(
      Array.from({ length: 6 }, () => ({
        status: 422,
        body: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed.",
          },
        },
      })),
    );
  }
  const boundary = await app.handle(
    request("/api/notes", { title: "x".repeat(200) }),
  );
  expect(boundary.status).toBe(201);
  expect((await boundary.json()).title).toHaveLength(200);
});

test("list orders by creation time then ID and caps results at 100 notes", async () => {
  const older = new Date("2026-01-01T00:00:00.000Z");
  const newer = new Date("2026-01-02T00:00:00.000Z");
  const rows = Array.from({ length: 102 }, (_, index) => ({
    id: `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`,
    title: `Synthetic note ${index}`,
    createdAt: index === 0 ? newer : older,
  }));
  await database.db.insert(notes).values(rows);
  const response = await app.handle(request());
  const result = await response.json();
  expect(result).toHaveLength(100);
  expect(result.map((note: { id: string }) => note.id)).toEqual([
    rows[0]!.id,
    ...rows
      .slice(3)
      .reverse()
      .map((note) => note.id),
  ]);
});

test("an unreachable database returns sanitized storage errors", async () => {
  const unreachable = createDatabase(
    "postgresql://synthetic:synthetic@127.0.0.1:1/unreachable",
  );
  try {
    const unavailableApp = createApp({ db: unreachable.db });
    for (const req of [
      request(),
      request("/api/notes", { title: "Synthetic note" }),
    ]) {
      const response = await unavailableApp.handle(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      });
    }
  } finally {
    await unreachable.close();
  }
});

test("offline OpenAPI export contains the actual operations, schemas and stable IDs", async () => {
  const exported = await exportOpenApi();
  expect(exported).toBe(await exportOpenApi());
  const contract = JSON.parse(exported);
  const response = await app.handle(request("/api/openapi/json"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(contract);
  expect(Object.keys(contract.paths)).toEqual(["/api/notes"]);
  const { get, post } = contract.paths["/api/notes"];
  expect(get.operationId).toBe("listNotes");
  expect(post.operationId).toBe("createNote");
  expect(Object.keys(get.responses).sort()).toEqual(["200", "500"]);
  expect(Object.keys(post.responses).sort()).toEqual(["201", "422", "500"]);
  const input = post.requestBody.content["application/json"].schema;
  expect(input.required).toContain("title");
  expect(input.properties.title).toMatchObject({
    type: "string",
    minLength: 1,
    maxLength: 200,
    pattern: "\\S",
  });
  const note = post.responses["201"].content["application/json"].schema;
  expect(note.required).toEqual(["id", "title", "createdAt"]);
  expect(note.properties.id.format).toBe("uuid");
  expect(note.properties.createdAt.format).toBe("date-time");
  expect(get.responses["200"].content["application/json"].schema.items).toEqual(
    note,
  );
  expect(
    post.responses["422"].content["application/json"].schema.properties.error
      .required,
  ).toEqual(["code", "message"]);
});
