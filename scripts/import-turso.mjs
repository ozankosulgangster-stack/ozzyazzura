// Run only against an EMPTY migration database. Never runs opening-stock seeds.
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { createClient } from '@libsql/client';
const directory = process.argv[2];
if (!directory || !process.env.TURSO_DATABASE_URL) throw new Error('Provide backup directory and TURSO_DATABASE_URL (plus TURSO_AUTH_TOKEN for remote).');
const root = resolve(directory);
for (const line of (await readFile(join(root, 'SHA256SUMS'), 'utf8')).trim().split('\n')) {
  const [hash, name] = line.split('  ');
  if (!name || name.includes('/') || name.includes('..')) throw new Error('Invalid backup filename');
  if (createHash('sha256').update(await readFile(join(root, name))).digest('hex') !== hash) throw new Error('Backup checksum mismatch');
}
const source = new DatabaseSync(join(root, 'production.sqlite'), { readOnly: true });
const records = JSON.parse(await readFile(join(root, 'production-records.json'), 'utf8'));
if (records.tables.customers.rows.length || records.tables.orders.rows.some(row => row.customer_auth_user_id)) throw new Error('Legacy customer identities require explicit mapping before import.');
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const transaction = await client.transaction('write');
const quote = value => '"' + value.replaceAll('"', '""') + '"';
const canonical = rows => rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort()))).sort();
try {
  const existing = await transaction.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (existing.rows.length) throw new Error('Destination is not empty; refusing to overwrite it.');
  const objects = source.prepare("SELECT type,name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END,name").all();
  await transaction.execute('PRAGMA defer_foreign_keys = ON');
  for (const object of objects.filter(o => o.type !== 'trigger')) await transaction.execute(object.sql);
  for (const [table, data] of Object.entries(records.tables)) {
    const rows = source.prepare(`SELECT * FROM ${quote(table)}`).all();
    if (JSON.stringify(canonical(rows)) !== JSON.stringify(canonical(data.rows))) throw new Error('Source records differ');
    for (const row of rows) {
      const columns = Object.keys(row);
      await transaction.execute({ sql: `INSERT INTO ${quote(table)} (${columns.map(quote).join(',')}) VALUES (${columns.map(() => '?').join(',')})`, args: Object.values(row) });
    }
    const restored = await transaction.execute(`SELECT * FROM ${quote(table)}`);
    if (JSON.stringify(canonical(restored.rows)) !== JSON.stringify(canonical(rows))) throw new Error('Restored records differ');
  }
  // Install stock-changing triggers only AFTER restoring existing balances/history.
  for (const object of objects.filter(o => o.type === 'trigger')) await transaction.execute(object.sql);
  if ((await transaction.execute('PRAGMA foreign_key_check')).rows.length) throw new Error('Foreign key validation failed');
  await transaction.commit();
  console.log('Imported and verified all application records. No existing destination data was overwritten.');
} catch (error) {
  await transaction.rollback();
  throw error;
} finally { transaction.close(); client.close(); source.close(); }
