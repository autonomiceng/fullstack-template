# Fullstack Template

An MIT starter with a working Notes example: Bun/Elysia and OpenAPI, React with TanStack Router and Query, Vite+, mise, and PostgreSQL with Drizzle.

## Start locally

Install [mise](https://mise.jdx.dev/) and Docker with Compose, then run from the checkout:

```sh
mise trust
mise install
mise run demo
```

The demo installs frozen dependencies, starts isolated PostgreSQL, applies migrations, builds the frontend and starts Bun serving the application. Open the printed loopback URL. Stop it with Ctrl+C; the owned application and database stop, and the checkout’s demo data remains for your next run. Use `mise run demo:destroy` while the demo and development tasks are stopped to remove that local data.

For development with frontend reloads:

```sh
mise run dev
```

Vite proxies `/api` to Bun. Tool versions live in `mise.toml`; dependencies and their versions live in `package.json` and `bun.lock`.

## What the example does

Create a Note with a title, then reload to see it persisted in PostgreSQL. Titles must contain a nonwhitespace character and have a raw length of 1–200 characters; storage trims surrounding whitespace. The server assigns a UUID and UTC creation timestamp. The list contains the newest 100 Notes, ordered by creation time and then ID descending.

`GET /api/notes` lists Notes and `POST /api/notes` creates one. Runtime schemas validate requests and describe success and sanitized error responses in OpenAPI. Validation returns HTTP 422; storage failures return HTTP 500. The example covers creation and listing only.

## Commands and configuration

| Command                     | Purpose                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `mise run demo`             | Build and run the complete local example                                           |
| `mise run dev`              | Run Vite, Bun and local PostgreSQL for development                                 |
| `mise run demo:destroy`     | Remove the stopped checkout’s local demo database volume                           |
| `mise run test`             | Run application tests and tooling safeguards                                       |
| `mise run test:app`         | Run six backend integration cases and one browser journey with isolated PostgreSQL |
| `mise run app:check`        | Run application lint and integrated type checks                                    |
| `mise run build`            | Build the frontend for Bun to serve                                                |
| `mise run openapi:generate` | Refresh the checked-in API contract without a database connection                  |
| `mise run openapi:check`    | Check the API contract without changing files                                      |
| `mise run db:migrate`       | Apply checked-in SQL migrations to an explicit `DATABASE_URL`                      |
| `mise run pr:check`         | Run the contribution gate shared with CI                                           |

See [.env.example](.env.example) for synthetic configuration. Demo and development tasks derive their database connection and assigned ports; copying an environment file is unnecessary for those tasks. Application tests use separate databases and remove their owned volumes on exit. When running Bun against a database you manage, set `DATABASE_URL` explicitly and run `mise run db:migrate` before starting the server. `HOST` and `PORT` control listening; `ASSETS_DIR=dist` enables serving the built SPA. `NODE_ENV` selects the runtime environment. Startup never pushes the schema. Review and commit generated SQL migrations; preserve migrations already applied to shared databases.

Clean `main` supports setup, demo and tests. The local PR gate additionally requires a fetched `origin/main` and a new staged or committed changelog fragment. Follow [CONTRIBUTING.md](CONTRIBUTING.md) for contribution checks and formatting.

## Structure

| Location                          | Responsibility                                                          |
| --------------------------------- | ----------------------------------------------------------------------- |
| `src/server/app.ts`               | Construct routes and OpenAPI with an injected database; does not listen |
| `src/server/index.ts`             | Validate configuration, listen and shut down                            |
| `src/server/notes.ts`             | Trim titles, write Notes and query the newest 100                       |
| `src/server/db/`, `drizzle/`      | Connection lifecycle, schema and explicit SQL migrations                |
| `src/shared/notes.ts`             | Browser-safe runtime schemas and inferred contract types                |
| `src/web/`                        | React screen, navigation, query cache and typed fetch helper            |
| `tests/server/`, `tests/browser/` | PostgreSQL integration cases and the browser journey                    |
| `.mise/tasks/`, `mise.toml`       | One local and CI task graph                                             |

PostgreSQL owns durable state. TanStack Query owns the browser's server-state cache and invalidates the list after creation; TanStack Router owns navigation. Component state holds input and local presentation. The browser imports shared contracts without server runtime dependencies. [Architecture decisions](docs/adr/) explain the stack's tradeoffs.

## Use as a template

Choose GitHub's **Use this template** to create a repository under your own owner and name; a private repository is supported. Clone that repository and run the setup above. The application and task graph use generic package names and do not depend on the source repository's remote or owner.

Replace the example and project descriptions with your own product. Remove inherited fragments from `changes/` while keeping its README, add a fragment for your first customization, and update the changelog preview's project name. Retain applicable copyright and license notices in [LICENSE](LICENSE); add notices for your own work as appropriate. Keep credentials and real records outside Git.

Towncrier is optional. Removing it means updating its mise tasks and gate dependencies, `towncrier.toml`, fragment helpers and tests, CI release-note summary, and contributor policy together. Remove Python or uv pins only after checking their remaining consumers. Keep the application's checks and tests in the gate.

## Deployment assumptions

The built React SPA and API share one origin. Bun serves the built assets and client-route fallback; `/api` keeps API error behavior. Development uses the Vite proxy for the same URL convention. Hosting assets separately would require an explicit API base URL and a reviewed cross-origin policy.

Local launch tasks bind to loopback. Every user who can reach this example can read and create Notes anonymously. Add authentication and authorization before public exposure. Production needs managed database credentials, reviewed migrations, backups and process supervision; the template does not automate deployment.

Licensed under [MIT](LICENSE).
