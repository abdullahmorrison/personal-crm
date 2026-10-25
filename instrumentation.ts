// Runs once on server start: opening the database applies pending migrations.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getDb } = await import("@/lib/db");
  getDb();
}
