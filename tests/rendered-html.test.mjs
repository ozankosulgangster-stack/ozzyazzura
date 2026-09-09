import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Azzura commerce storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Azzura — Murano Glass &amp; Italian Leather<\/title>/i);
  assert.match(html, /Mosaico Necklace/);
  assert.match(html, /CA\$49\.99/);
  assert.match(html, /Bobbi Leather Bag/);
  assert.match(html, /href="\/track"/);
  assert.match(html, /href="\/account"/);
  assert.match(html, /Bag \(/);
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
  const [page, checkout, migration, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_brainy_the_hunter.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET/);
  assert.match(page, /beginCheckout/);
  assert.match(page, /Secure checkout/);
  assert.match(checkout, /productById/);
  assert.match(checkout, /line_items/);
  assert.match(migration, /CREATE TABLE `customers`/);
  assert.match(migration, /CREATE TABLE `orders`/);
  assert.match(migration, /CREATE TABLE `order_items`/);
  assert.equal(JSON.parse(hosting).d1, "DB");
});
