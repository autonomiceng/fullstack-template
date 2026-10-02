import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { Notes } from "./notes";

const rootRoute = createRootRoute({
  component: Shell,
  notFoundComponent: () => (
    <section className="panel not-found" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Page not found</h1>
      <p>This page does not exist.</p>
      <Link to="/">Return to Notes</Link>
    </section>
  ),
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Notes,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([notesRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Shell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Notes home">
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span>Notes</span>
        </Link>
        <nav aria-label="Resources">
          <a href="/api/notes">Notes API</a>
          <a href="/api/openapi/json">OpenAPI</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        A small place to start. Make it your own.
      </footer>
    </div>
  );
}
