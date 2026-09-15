import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

test('migration prevents overselling and makes payment/expiry idempotent', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const name of ['0000_brainy_the_hunter', '0001_fearless_wendell_rand', '0002_superb_ultragirl']) db.exec(readFileSync(new URL(`../drizzle/${name}.sql`, import.meta.url), 'utf8'));
    assert.equal(db.prepare('SELECT count(*) AS n FROM inventory').get().n, 25);
    const opening = readFileSync(new URL('../drizzle/0003_opening_stock.sql', import.meta.url), 'utf8');
    db.exec(opening);
    db.exec(opening);
    assert.equal(db.prepare('SELECT sum(on_hand) AS n FROM inventory').get().n, 125);
    assert.equal(db.prepare('SELECT count(*) AS n FROM inventory_adjustments').get().n, 25);
    db.exec('UPDATE inventory SET on_hand=0');
    db.exec("INSERT INTO orders (id,order_number,email,subtotal_cents,shipping_cents,total_cents,shipping_country,shipping_postal_code) VALUES ('o','AZ-test','test@example.com',100,0,100,'CA','M1M1M1')");
    db.exec("INSERT INTO inventory_adjustments (id,sku,delta,reason,actor) VALUES ('a','18:nero',2,'Opening count','test')");
    const stock = () => ({ ...db.prepare("SELECT on_hand,reserved FROM inventory WHERE sku='18:nero'").get() });
    db.exec("INSERT INTO stock_reservations(id,order_id,sku,quantity) VALUES ('r','o','18:nero',2)");
    assert.deepEqual(stock(), { on_hand: 2, reserved: 2 });
    assert.throws(() => db.exec("INSERT INTO stock_reservations(id,order_id,sku,quantity) VALUES ('r2','o','18:nero',1)"), /insufficient_stock/);
    assert.throws(() => db.exec("INSERT INTO inventory_adjustments(id,sku,delta,reason,actor) VALUES ('b','18:nero',-1,'Damage','test')"), /insufficient_stock/);
    db.exec("UPDATE stock_reservations SET status='paid' WHERE id='r' AND status='held'");
    db.exec("UPDATE stock_reservations SET status='paid' WHERE id='r' AND status='held'");
    db.exec("UPDATE stock_reservations SET status='released' WHERE id='r' AND status='held'");
    assert.deepEqual(stock(), { on_hand: 0, reserved: 0 });
    db.exec("UPDATE inventory SET on_hand=2 WHERE sku='18:nero'");
    db.exec("INSERT INTO stock_reservations(id,order_id,sku,quantity) VALUES ('r3','o','18:nero',1)");
    db.exec("UPDATE stock_reservations SET status='released' WHERE id='r3' AND status='held'");
    db.exec("UPDATE stock_reservations SET status='released' WHERE id='r3' AND status='held'");
    assert.deepEqual(stock(), { on_hand: 2, reserved: 0 });
  } finally { db.close(); }
});
