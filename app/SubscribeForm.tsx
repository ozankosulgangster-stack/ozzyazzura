"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source: "newsletter" }),
    });
    const result = await response.json() as { error?: string };
    if (response.ok) {
      setEmail("");
      setStatus("Thank you. You’re on the list.");
    } else setStatus(result.error ?? "We couldn’t save your email. Please try again.");
    setPending(false);
  }

  return <form onSubmit={subscribe}>
    <label className="sr-only" htmlFor="newsletter-email">Email address</label>
    <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" autoComplete="email" required />
    <button type="submit" disabled={pending}>{pending ? "Saving…" : "Subscribe"} <span>→</span></button>
    <small>By subscribing, you agree to receive Azzura news and may unsubscribe anytime.</small>
    <p className="newsletter-status" aria-live="polite">{status}</p>
  </form>;
}
