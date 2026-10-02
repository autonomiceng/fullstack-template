import { createApp } from "./app";
import { createDatabase } from "./db/connection";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const port = Number(process.env.PORT ?? "3000");
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("PORT must be an integer between 0 and 65535");
}

const database = createDatabase(databaseUrl);
const app = createApp({
  db: database.db,
  assetsDir: process.env.ASSETS_DIR ?? "dist",
}).listen({
  hostname: process.env.HOST ?? "127.0.0.1",
  port,
});
console.log(`Listening on ${app.server?.url.toString().replace(/\/$/, "")}`);

let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  await app.stop();
  await database.close();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
