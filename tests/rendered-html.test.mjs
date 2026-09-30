import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { before, after } from "node:test";
import { spawn } from "node:child_process";
let server;
const origin = "http://127.0.0.1:4189";
before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "4189"], {
    env: { ...process.env, NEXTAUTH_URL: origin, NEXTAUTH_SECRET: "local-test-secret-only-not-for-production", TURSO_DATABASE_URL: ":memory:" }, stdio: "ignore"
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await fetch(origin); return; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  throw new Error("Next.js test server did not start");
});
after(() => server?.kill());
async function render(path = "/") { return fetch(origin + path); }

test("server-renders the Azzura commerce storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Azzura — Murano Glass &amp; Italian Leather<\/title>/i);
  assert.match(html, /Mosaico Necklace/);
  assert.match(html, /CA\$69\.99/);
  assert.match(html, /Bobbi Leather Bag/);
  assert.match(html, /Colour for Ambra Leather Handbag/);
  assert.match(html, /value="papavero"/);
  assert.match(html, /value="testa-di-moro"/);
  assert.match(html, /Design, chosen/);
  assert.match(html, /Italian partnerships/);
  assert.match(html, /href="#contact"/);
  assert.match(html, /By subscribing, you agree to receive Azzura news/);
  assert.match(html, /href="\/track"/);
  assert.match(html, /href="\/account"/);
  assert.match(html, /href="\/return-policy"/);
  assert.match(html, /Bag \(/);
});

test("renders a complete public return and refund policy", async () => {
  const response = await render("/return-policy");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Return &amp; refund policy/i);
  assert.match(html, /30-day return window/i);
  assert.match(html, /Return shipping and fees/i);
  assert.match(html, /Items that cannot be returned/i);
  assert.match(html, /Refunds/i);
  assert.match(html, /href="\/#contact"/);
});

test("renders the public order-tracking page", async () => {
  const response = await render("/track");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Track your order/);
  assert.match(html, /Order number/);
  assert.match(html, /Order email/);
});

test("keeps pricing authoritative and payment secrets server-side", async () => {
  const [page, checkout, migration, contactsMigration, subscribersApi, contactApi, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_brainy_the_hunter.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_fearless_wendell_rand.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/subscribers/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET/);
  assert.match(page, /beginCheckout/);
  assert.match(page, /Secure checkout/);
  assert.match(checkout, /resolveSelection/);
  assert.match(checkout, /line_items/);
  assert.match(migration, /CREATE TABLE `customers`/);
  assert.match(migration, /CREATE TABLE `orders`/);
  assert.match(migration, /CREATE TABLE `order_items`/);
  assert.match(contactsMigration, /CREATE TABLE `contact_messages`/);
  assert.match(contactsMigration, /CREATE TABLE `subscribers`/);
  assert.match(contactsMigration, /PRAGMA optimize/);
  assert.match(subscribersApi, /ON CONFLICT\(email\) DO UPDATE/);
  assert.match(contactApi, /marketingOptIn/);
  assert.equal(JSON.parse(hosting).d1, "DB");
});

test("forged host identity headers cannot grant admin or customer access", async () => {
  const headers = { "oai-authenticated-user-email": "owner@example.com", "oai-authenticated-user-id": "owner" };
  const response = await fetch(origin + "/api/admin/orders", { headers });
  assert.equal(response.status, 403);
  const account = await fetch(origin + "/account", { headers, redirect: "manual" });
  assert.equal(account.status, 307);
  assert.match(account.headers.get("location"), /api\/auth\/signin/);
  const csrf = await fetch(origin + "/api/admin/inventory", { method: "POST", headers: { ...headers, origin: "https://attacker.example", "content-type": "application/json" }, body: "{}" });
  assert.equal(csrf.status, 403);
});
