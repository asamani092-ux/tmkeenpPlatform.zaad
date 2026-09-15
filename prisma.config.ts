// Prisma loads this for CLI (migrate/generate). Coolify injects DATABASE_URL —
// do not hard-require dotenv (production image has no node_modules/dotenv).
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv/config");
} catch {
  /* optional outside local/dev */
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
