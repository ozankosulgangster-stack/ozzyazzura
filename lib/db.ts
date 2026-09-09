import { env } from "cloudflare:workers";

export function getDatabase(): D1Database {
  const db = (env as { DB?: D1Database }).DB;
  if (!db) throw new Error("Database binding is unavailable.");
  return db;
}
