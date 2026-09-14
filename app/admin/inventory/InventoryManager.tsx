"use client";
import { useEffect, useState } from "react";
import type { StockRow } from "@/lib/inventory";
type Adjustment = { sku: string; delta: number; reason: string; actor: string; created_at: string };
export default function InventoryManager() {
  const [items, setItems] = useState<StockRow[]>([]);
  const [history, setHistory] = useState<Adjustment[]>([]);
  const [query, setQuery] = useState("");
  const [sku, setSku] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryId, setRetryId] = useState<string | null>(null);
  async function refresh() {
    const response = await fetch("/api/admin/inventory", { cache: "no-store" });
    const data = await response.json() as { items: StockRow[]; history: Adjustment[]; error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not load inventory.");
    setItems(data.items); setHistory(data.history);
  }
  useEffect(() => { refresh().catch((error) => setMessage(error.message)); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const id = retryId ?? crypto.randomUUID(); setRetryId(id);
    try {
      const response = await fetch("/api/admin/inventory", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, sku, delta: Number(delta), reason }) });
      const data = await response.json() as { items: StockRow[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save inventory.");
      setItems(data.items); setDelta(""); setReason(""); setRetryId(null);
      setMessage("Stock updated."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save inventory."); }
    finally { setBusy(false); }
  }
  function changed() { setRetryId(null); }
  return <div className="inventory-manager">
    <p>On hand includes units reserved for checkout. Available stock is what customers can buy. New products start at zero; enter your opening counts below.</p>
    <form className="inventory-adjustment" onSubmit={save}>
      <h2>Adjust stock</h2>
      <label>Product and colour<select required value={sku} disabled={busy} onChange={(event) => { setSku(event.target.value); changed(); }}><option value="">Choose a product</option>{items.map((item) => <option key={item.sku} value={item.sku}>{item.name}</option>)}</select></label>
      <label>Quantity to add or remove<input required type="number" step="1" min="-100000" max="100000" value={delta} disabled={busy} placeholder="e.g. 10 or -2" onChange={(event) => { setDelta(event.target.value); changed(); }} /></label>
      <label>Reason<input required maxLength={300} value={reason} disabled={busy} placeholder="Opening count, delivery, damage, or returned order number" onChange={(event) => { setReason(event.target.value); changed(); }} /></label>
      <button disabled={busy} type="submit">{busy ? "Saving…" : "Save adjustment"}</button>
    </form>
    <p role="status">{message}</p>
    <div className="inventory-toolbar"><label>Find a product<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or colours" /></label><button type="button" disabled={busy} onClick={() => refresh().catch((error) => setMessage(error.message))}>Refresh stock</button></div>
    <div className="inventory-table"><table><caption>Current stock</caption><thead><tr><th>Product / colour</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Status</th></tr></thead><tbody>{items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).map((item) => <tr key={item.sku}><th scope="row">{item.name}</th><td>{item.on_hand}</td><td>{item.reserved}</td><td>{item.available}</td><td>{item.available === 0 ? "Sold out" : item.available <= 3 ? "Low stock" : "In stock"}</td></tr>)}</tbody></table></div>
    <p>Checkout reservations release after Stripe confirms expiry (about 31 minutes). Refunds and order-status changes do not restock items: inspect returned goods, then add sellable units with the order number as the reason.</p>
    <h2>Recent adjustments</h2><div className="inventory-table"><table><thead><tr><th>Product</th><th>Change</th><th>Reason</th><th>Date</th></tr></thead><tbody>{history.map((entry, index) => <tr key={index}><td>{items.find((item) => item.sku === entry.sku)?.name ?? entry.sku}</td><td>{entry.delta > 0 ? "+" : ""}{entry.delta}</td><td>{entry.reason}</td><td>{entry.created_at}</td></tr>)}</tbody></table>{history.length === 0 && <p>No stock adjustments yet.</p>}</div>
  </div>;
}
