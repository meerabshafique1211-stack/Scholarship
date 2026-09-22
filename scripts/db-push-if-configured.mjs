// Runs during `npm run build`. Applies the schema only when a database is configured,
// so the site still builds (with honest empty states) before a database exists.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("[db] DATABASE_URL not set. Skipping schema push; scholarship results will be empty.");
  process.exit(0);
}
console.log("[db] Applying Prisma schema…");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
