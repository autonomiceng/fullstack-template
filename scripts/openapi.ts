import { drizzle } from "drizzle-orm/node-postgres";
import { createApp } from "../src/server/app";
import * as schema from "../src/server/db/schema";

export async function exportOpenApi() {
  // The exporter constructs the real routes without creating a database connection.
  const app = createApp({ db: drizzle.mock({ schema }) });
  const response = await app.handle(
    new Request("http://localhost/api/openapi/json"),
  );
  if (!response.ok)
    throw new Error(`OpenAPI export failed: ${response.status}`);
  return `${JSON.stringify(await response.json(), null, 2)}\n`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check"))
    throw new Error("Usage: openapi.ts [--check]");
  const output = await exportOpenApi();
  const artifact = Bun.file(
    new URL("../contracts/openapi.json", import.meta.url),
  );
  if (args.includes("--check")) {
    if (!(await artifact.exists()) || (await artifact.text()) !== output) {
      throw new Error(
        "OpenAPI contract is out of date. Run mise run openapi:generate.",
      );
    }
    console.log("OpenAPI contract is current.");
  } else {
    await Bun.write(artifact, output);
    console.log("OpenAPI contract generated.");
  }
}
