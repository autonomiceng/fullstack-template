import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const path = "src/server/notes.ts";
const fixtures = [
  {
    name: "missing comment",
    source: "export function example() {}",
    rule: "require-jsdoc",
  },
  {
    name: "missing comment on a separately exported function",
    source: "function read() {}\nexport { read };",
    rule: "require-jsdoc",
  },
  {
    name: "empty description",
    source: "/** @public */\nexport function example() {}",
    rule: "require-description",
  },
  {
    name: "documented export",
    source:
      "/** Reads Notes without changing stored state. */\nexport function example() {}",
    rule: null,
  },
  {
    name: "private helper in a scoped module",
    source:
      "function helper() {}\n/** Reads Notes without changing stored state. */\nexport function example() { helper(); }",
    rule: null,
  },
];

const workspace = process.cwd();
const directory = await mkdtemp(join(tmpdir(), "template-documentation-"));
try {
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({
      name: "documentation-policy-fixture",
      private: true,
      type: "module",
    }),
  );
  await symlink(
    resolve(workspace, "vite.config.ts"),
    join(directory, "vite.config.ts"),
  );
  await symlink(
    resolve(workspace, "node_modules"),
    join(directory, "node_modules"),
  );
  await mkdir(dirname(join(directory, path)), { recursive: true });
  for (const fixture of fixtures) {
    await writeFile(join(directory, path), fixture.source);
    const child = Bun.spawn(["./node_modules/.bin/vp", "lint", path], {
      cwd: directory,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    const output = stdout + stderr;
    if (
      fixture.rule
        ? code !== 1 || !output.includes(`jsdoc-js(${fixture.rule})`)
        : code !== 0
    ) {
      throw new Error(
        `Documentation safeguard failed (${path}: ${fixture.name}, exit ${code}):\n${output}`,
      );
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
console.log("Documentation requirements and private helper exclusions passed.");
