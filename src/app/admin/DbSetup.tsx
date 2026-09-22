export function DbSetup() {
  return (
    <div className="max-w-2xl rounded-md border border-caution/40 bg-caution-tint p-5 text-sm text-ink">
      <p className="font-semibold">No database is connected.</p>
      <p className="mt-2">Scholarship records and synced universities are stored in PostgreSQL. In Vercel, open this project → Storage → create a Postgres database (for example Neon) and connect it. That sets <code>DATABASE_URL</code>. Then redeploy; the schema is applied automatically during the build.</p>
    </div>
  );
}
