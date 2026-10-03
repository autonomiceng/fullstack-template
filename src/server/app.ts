import { openapi } from "@elysia/openapi";
import { staticPlugin } from "@elysia/static";
import { Elysia } from "elysia";
import { join } from "node:path";
import {
  CreateNoteSchema,
  ErrorSchema,
  NoteSchema,
  NotesSchema,
} from "../shared/notes";
import type { Database } from "./db/connection";
import { createNote, listNotes } from "./notes";

const notFound = { error: { code: "NOT_FOUND", message: "Route not found." } };

/**
 * Builds anonymous Notes routes and OpenAPI without listening or owning the database.
 * With assetsDir, serves the SPA while preserving API errors; storage errors are sanitized.
 */
export function createApp({
  db,
  assetsDir,
}: {
  db: Database;
  assetsDir?: string;
}) {
  const app = new Elysia()
    .onError(({ code, status }) => {
      if (code === "VALIDATION" || code === "PARSE") {
        return status(422, {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed.",
          },
        });
      }
      if (code === "NOT_FOUND") return status(404, notFound);
      return status(500, {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      });
    })
    .use(
      openapi({
        path: "/api/openapi",
        provider: null,
        documentation: {
          info: { title: "Notes API", version: "1.0.0" },
        },
      }),
    )
    .get("/api/notes", () => listNotes(db), {
      response: { 200: NotesSchema, 500: ErrorSchema },
      detail: {
        operationId: "listNotes",
        summary: "List the newest 100 notes",
      },
    })
    .post(
      "/api/notes",
      async ({ body, status }) => status(201, await createNote(db, body)),
      {
        body: CreateNoteSchema,
        response: { 201: NoteSchema, 422: ErrorSchema, 500: ErrorSchema },
        detail: { operationId: "createNote", summary: "Create a note" },
      },
    );

  if (assetsDir) {
    app.use(
      staticPlugin({
        assets: assetsDir,
        prefix: "",
        alwaysStatic: true,
        indexHTML: false,
        detail: { hide: true },
      }),
    );
    app.get(
      "/*",
      ({ path, status }) => {
        if (path === "/api" || path.startsWith("/api/"))
          return status(404, notFound);
        return Bun.file(join(assetsDir, "index.html"));
      },
      { detail: { hide: true } },
    );
  }

  return app;
}
