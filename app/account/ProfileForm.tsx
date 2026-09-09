"use client";

import { useState } from "react";

export type Profile = {
  full_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    fullName: profile?.full_name ?? "",
    addressLine1: profile?.address_line1 ?? "",
    addressLine2: profile?.address_line2 ?? "",
    city: profile?.city ?? "",
    province: profile?.province ?? "",
    postalCode: profile?.postal_code ?? "",
    country: profile?.country ?? "CA",
  });
  const [status, setStatus] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Saving…");
    const response = await fetch("/api/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json() as { error?: string };
    setStatus(response.ok ? "Saved." : result.error ?? "Could not save your details.");
  }

  const field = (name: keyof typeof form) => ({ value: form[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [name]: event.target.value })) });

  return <form className="account-form" onSubmit={save}>
    <h2>Saved delivery details</h2>
    <label>Full name<input {...field("fullName")} autoComplete="name" /></label>
    <label>Address<input {...field("addressLine1")} autoComplete="address-line1" required /></label>
    <label>Apartment, suite, or unit<input {...field("addressLine2")} autoComplete="address-line2" /></label>
    <div><label>City<input {...field("city")} autoComplete="address-level2" required /></label><label>Province or state<input {...field("province")} autoComplete="address-level1" required /></label></div>
    <div><label>Postal code<input {...field("postalCode")} autoComplete="postal-code" required /></label><label>Country<select {...field("country")}><option value="CA">Canada</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="IT">Italy</option><option value="FR">France</option><option value="DE">Germany</option><option value="ES">Spain</option><option value="AU">Australia</option><option value="JP">Japan</option></select></label></div>
    <button type="submit">Save details <span>→</span></button>
    <p className="form-status" aria-live="polite">{status}</p>
  </form>;
}
