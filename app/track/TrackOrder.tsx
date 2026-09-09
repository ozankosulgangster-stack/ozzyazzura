"use client";

import { useState } from "react";

type Order = { order_number: string; status: string; total_cents: number; tracking_carrier: string | null; tracking_number: string | null; tracking_url: string | null; created_at: string; updated_at: string };

export default function TrackOrder() {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    const response = await fetch(`/api/orders/track?order=${encodeURIComponent(order)}&email=${encodeURIComponent(email)}`);
    const body = await response.json() as Order & { error?: string };
    if (response.ok) setResult(body); else setError(body.error ?? "Order lookup failed.");
    setLoading(false);
  }

  return <>
    <form className="track-form" onSubmit={lookup}><label>Order number<input value={order} onChange={(event) => setOrder(event.target.value)} placeholder="AZ-…" required /></label><label>Order email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><button type="submit" disabled={loading}>{loading ? "Looking up…" : "Track order"}<span>→</span></button></form>
    {error && <p className="track-error" role="alert">{error}</p>}
    {result && <article className="tracking-card"><p className="eyebrow">Order {result.order_number}</p><div><span>Status</span><strong>{result.status.replaceAll("_", " ")}</strong></div><div><span>Order total</span><strong>CA${(result.total_cents / 100).toFixed(2)}</strong></div><div><span>Last update</span><strong>{new Date(result.updated_at).toLocaleDateString("en-CA")}</strong></div>{result.tracking_number ? <div><span>{result.tracking_carrier || "Carrier"}</span><strong>{result.tracking_number}</strong></div> : <p>Tracking will appear here as soon as your order ships.</p>}{result.tracking_url && <a href={result.tracking_url} target="_blank" rel="noreferrer">Open carrier tracking →</a>}</article>}
  </>;
}
