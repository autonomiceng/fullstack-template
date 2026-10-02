import { createApp } from "../../src/server/app";
import { createDatabase } from "../../src/server/db/connection";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is required");
const database = createDatabase(url);
try {
  const app = createApp({ db: database.db });
  const bodies = [
    { title: "" },
    { title: " \t\n " },
    { title: "x".repeat(201) },
    { title: `${" ".repeat(200)}x` },
    { title: 1 },
    {},
  ];
  const results = [];
  for (const body of bodies) {
    const response = await app.handle(
      new Request("http://localhost/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    results.push({ status: response.status, body: await response.json() });
  }
  console.log(JSON.stringify(results));
} finally {
  await database.close();
}
