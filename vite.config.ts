import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "browser-boundary",
      generateBundle() {
        for (const id of this.getModuleIds()) {
          const normalized = id.replaceAll("\\", "/");
          if (
            normalized.includes("/src/server/") ||
            /\/node_modules\/(?:elysia|@elysia|drizzle-orm|pg|pg-pool|pg-protocol)\//.test(
              normalized,
            )
          ) {
            this.error(`Server module reached the browser bundle: ${id}`);
          }
        }
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    proxy: { "/api": process.env.API_ORIGIN ?? "http://127.0.0.1:3000" },
  },
  fmt: {
    printWidth: 80,
    proseWrap: "preserve",
    endOfLine: "lf",
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: ["bun.lock", "drizzle/meta/**", "contracts/openapi.json"],
  },
  lint: {
    ignorePatterns: ["dist/**", ".scratch/**", "node_modules/**"],
    options: { typeAware: true, typeCheck: true },
    jsPlugins: [{ name: "jsdoc-js", specifier: "eslint-plugin-jsdoc" }],
    overrides: [
      {
        files: [
          "src/server/notes.ts",
          "src/server/app.ts",
          "src/server/db/connection.ts",
          "src/web/api.ts",
        ],
        rules: {
          "jsdoc-js/require-jsdoc": [
            "error",
            {
              publicOnly: {
                esm: true,
                cjs: false,
                window: false,
                ancestorsOnly: false,
              },
              enableFixer: false,
              require: {
                FunctionDeclaration: true,
                ArrowFunctionExpression: true,
                FunctionExpression: true,
              },
            },
          ],
          "jsdoc-js/require-description": [
            "error",
            { contexts: ["any"], descriptionStyle: "body", exemptedBy: [] },
          ],
        },
      },
    ],
  },
});
