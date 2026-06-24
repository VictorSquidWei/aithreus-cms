import { defineConfig } from "drizzle-kit";

// drizzle-kit reads this for `generate` (offline SQL) and `push`/`migrate` (needs DATABASE_URL).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/placeholder" },
});
