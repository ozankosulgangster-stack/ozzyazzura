import { createClient, type Client, type InValue, type ResultSet } from "@libsql/client";

function result<T>(value: ResultSet) {
  return { results: value.rows.map(row => ({ ...row })) as T[], meta: { changes: value.rowsAffected } };
}
export class Statement {
  constructor(readonly client: Client, readonly sql: string, readonly args: InValue[] = []) {}
  bind(...args: InValue[]) { return new Statement(this.client, this.sql, args); }
  async all<T = Record<string, unknown>>() { return result<T>(await this.client.execute({ sql: this.sql, args: this.args })); }
  async first<T = Record<string, unknown>>() { return (await this.all<T>()).results[0] ?? null; }
  async run() { return this.all(); }
}
export function databaseAdapter(client: Client) {
  return {
    prepare: (sql: string) => new Statement(client, sql),
    // One write transaction: a failed stock trigger rolls back the entire checkout.
    batch: async (statements: Statement[]) => (await client.batch(statements.map(s => ({ sql: s.sql, args: s.args })), "write")).map(r => result(r)),
  };
}
let database: ReturnType<typeof databaseAdapter> | undefined;
export function getDatabase() {
  if (!database) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not configured.");
    if (process.env.NETLIFY && !url.startsWith("libsql://") && !url.startsWith("https://")) throw new Error("Hosted database must be remote.");
    database = databaseAdapter(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }));
  }
  return database;
}
