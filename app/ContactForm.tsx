"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", marketingOptIn: false, website: "" });
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json() as { error?: string; saved?: boolean; notification?: string };
      if (response.ok && result.saved) {
        setForm({ name: "", email: "", message: "", marketingOptIn: false, website: "" });
        setStatus(result.notification === "accepted"
          ? "Thank you. Your enquiry has been saved and an email notification has been queued for our team."
          : "Your enquiry has been saved, but we couldn’t send the email notification. Please email us directly if you need a prompt reply.");
      } else setStatus(result.error ?? "Your message could not be saved. Please try again.");
    } catch {
      setStatus("We couldn’t confirm receipt of your enquiry. Please email us directly or try again.");
    } finally {
      setPending(false);
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <div><label>Name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} autoComplete="name" required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} autoComplete="email" required /></label></div>
    <label>How can we help?<textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} rows={5} required /></label>
    <label className="contact-consent"><input type="checkbox" checked={form.marketingOptIn} onChange={(event) => setForm((current) => ({ ...current, marketingOptIn: event.target.checked }))} /><span>Keep me informed about new collections and Azzura news. I can unsubscribe at any time.</span></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} tabIndex={-1} autoComplete="off" /></label>
    <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}<span>→</span></button>
    <p className="form-status" aria-live="polite">{status}</p>
    <p>Prefer email? <a href="mailto:ozan@ozzyazzura.ca">ozan@ozzyazzura.ca</a></p>
  </form>;
}
