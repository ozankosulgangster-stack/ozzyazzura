"use client";

import { useState } from "react";

export type ManagedOrder = { order_number: string; email: string; status: string; total_cents: number; tracking_carrier: string | null; tracking_number: string | null; tracking_url: string | null; created_at: string; updated_at: string };

export default function OrderManager({ initialOrders }: { initialOrders: ManagedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");

  function update(orderNumber: string, field: "status" | "tracking_carrier" | "tracking_number", value: string) {
    setOrders((current) => current.map((order) => order.order_number === orderNumber ? { ...order, [field]: value } : order));
  }

  async function save(order: ManagedOrder) {
    setMessage(`Saving ${order.order_number}…`);
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderNumber: order.order_number, status: order.status, carrier: order.tracking_carrier, trackingNumber: order.tracking_number }) });
    const result = await response.json() as { error?: string; trackingUrl?: string | null };
    if (response.ok) {
      setOrders((current) => current.map((item) => item.order_number === order.order_number ? { ...item, tracking_url: result.trackingUrl ?? null } : item));
      setMessage(`${order.order_number} saved.`);
    } else setMessage(result.error ?? "Could not save order.");
  }

  if (orders.length === 0) return <p className="admin-empty">No orders yet.</p>;
  return <div className="admin-orders"><p className="form-status" aria-live="polite">{message}</p>{orders.map((order) => <article key={order.order_number}>
    <div className="admin-order-heading"><div><strong>{order.order_number}</strong><span>{order.email}</span></div><div><strong>CA${(order.total_cents / 100).toFixed(2)}</strong><span>{new Date(order.created_at).toLocaleDateString("en-CA")}</span></div></div>
    <div className="admin-order-fields"><label>Status<select value={order.status} onChange={(event) => update(order.order_number, "status", event.target.value)}><option value="pending">Pending</option><option value="paid">Paid</option><option value="preparing">Preparing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></label><label>Carrier<input value={order.tracking_carrier ?? ""} onChange={(event) => update(order.order_number, "tracking_carrier", event.target.value)} placeholder="Canada Post" /></label><label>Tracking number<input value={order.tracking_number ?? ""} onChange={(event) => update(order.order_number, "tracking_number", event.target.value)} /></label><button type="button" onClick={() => save(order)}>Save</button></div>
  </article>)}</div>;
}
