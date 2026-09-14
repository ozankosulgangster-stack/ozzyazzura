import { getDatabase } from "@/lib/db";
import { stockCatalog } from "@/lib/catalog";

export type StockRow = { sku: string; name: string; on_hand: number; reserved: number; available: number };
export async function readInventory(): Promise<StockRow[]> {
  const result = await getDatabase().prepare("SELECT sku, on_hand, reserved FROM inventory").all<{ sku: string; on_hand: number; reserved: number }>();
  return stockCatalog.map((item) => {
    const row = result.results.find((row) => row.sku === item.sku);
    return { ...item, on_hand: row?.on_hand ?? 0, reserved: row?.reserved ?? 0, available: (row?.on_hand ?? 0) - (row?.reserved ?? 0) };
  });
}

// Only call after a definitive Stripe failure or signed expiry event, never on a browser redirect.
export async function releaseOrderStock(orderId: string, status: string) {
  const db = getDatabase();
  await db.batch([
    db.prepare("UPDATE stock_reservations SET status = 'released' WHERE order_id = ? AND status = 'held'").bind(orderId),
    db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'checkout_unknown')").bind(status, orderId),
  ]);
}
