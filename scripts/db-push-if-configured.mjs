// Schema changes are applied with the SQL files in supabase/migrations (run once in Supabase).
// Automatic `prisma db push` during builds is opt-in only, to avoid unintended changes to production.
import { execSync } from "node:child_process";

if (process.env.PRISMA_DB_PUSH !== "1" || !process.env.DATABASE_URL) {
  console.log("[db] Skipping schema push (set PRISMA_DB_PUSH=1 to enable). Apply supabase/migrations/*.sql instead.");
  process.exit(0);
}
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
