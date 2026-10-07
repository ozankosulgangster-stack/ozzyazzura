import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { createClient } from '@libsql/client';
const require = createRequire(import.meta.url);
const source = (await readFile(new URL('../lib/db.ts', import.meta.url), 'utf8')).replace('"@libsql/client"', JSON.stringify(pathToFileURL(require.resolve('@libsql/client')).href));
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { databaseAdapter } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('Turso adapter atomically rolls back oversold checkout and preserves idempotent payment', async () => {
 const client = createClient({ url: ':memory:' });
 try {
  for (const name of ['0000_brainy_the_hunter','0001_fearless_wendell_rand','0002_superb_ultragirl','0003_opening_stock']) await client.executeMultiple(await readFile(new URL(`../drizzle/${name}.sql`, import.meta.url), 'utf8'));
  const db = databaseAdapter(client);
  const order = id => db.prepare("INSERT INTO orders (id,order_number,email,subtotal_cents,shipping_cents,total_cents,shipping_country,shipping_postal_code) VALUES (?,?,'test@example.com',100,0,100,'CA','M1M1M1')").bind(id,id);
  const reserve = (id, qty) => db.prepare("INSERT INTO stock_reservations(id,order_id,sku,quantity) VALUES (?,?,'18:nero',?)").bind(id,id,qty);
  await assert.rejects(db.batch([order('oversold'),reserve('oversold',6)]), /insufficient_stock/);
  assert.equal(await db.prepare("SELECT id FROM orders WHERE id='oversold'").first(),null);
  await db.batch([order('valid'),reserve('valid',2)]);
  assert.equal((await db.prepare("SELECT reserved FROM inventory WHERE sku='18:nero'").first()).reserved,2);
  for(let i=0;i<2;i++) await db.prepare("UPDATE stock_reservations SET status='paid' WHERE id='valid' AND status='held'").run();
  assert.deepEqual(await db.prepare("SELECT on_hand,reserved FROM inventory WHERE sku='18:nero'").first(),{on_hand:3,reserved:0});
 } finally {client.close();}
});
