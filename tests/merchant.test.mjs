import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`;
const catalog = moduleUrl(await readFile(new URL('../lib/catalog.ts', import.meta.url), 'utf8'));
const source = (await readFile(new URL('../lib/merchant.ts', import.meta.url), 'utf8')).replace('"./catalog"', JSON.stringify(catalog));
const { merchantProducts, authorizedMerchantRequest, merchantConfigured, syncMerchantProducts, merchantServiceAccount } = await import(moduleUrl(source));

test('offers preserve variant identities, exact CAD prices and stock availability', () => {
  const items = merchantProducts([{ sku: '18:nero', available: 2 }]);
  assert.equal(items.length, 25);
  assert.equal(new Set(items.map((item) => item.offerId)).size, 25);
  const black = items.find((item) => item.offerId === '18:nero');
  assert.equal(black.productAttributes.availability, 'IN_STOCK');
  assert.equal(black.productAttributes.color, 'Nero (black)');
  assert.equal(black.productAttributes.link, 'https://ozzyazzura.ca/products/18?colour=nero');
  assert.equal(items.find((item) => item.offerId === '18:limone').productAttributes.availability, 'OUT_OF_STOCK');
  assert.deepEqual(items.find((item) => item.offerId === '2:default').productAttributes.price, { amountMicros: '24990000', currencyCode: 'CAD' });
});

test('integration rejects missing, short and incorrect tokens', async () => {
  const secret = 'test-only-token-'.repeat(4);
  const request = (value) => new Request('https://ozzyazzura.ca/api/merchant/products', { headers: value ? { authorization: `Bearer ${value}` } : {} });
  assert.equal(await authorizedMerchantRequest(request(), {}), false);
  assert.equal(await authorizedMerchantRequest(request(secret), { MERCHANT_SYNC_TOKEN: 'short' }), false);
  assert.equal(await authorizedMerchantRequest(request('wrong'), { MERCHANT_SYNC_TOKEN: secret }), false);
  assert.equal(await authorizedMerchantRequest(request(secret), { MERCHANT_SYNC_TOKEN: secret }), true);
  assert.equal(merchantConfigured({}), false);
});

test('sync signs service-account assertion and reports partial Google failures', async () => {
  const key = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const pem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(await crypto.subtle.exportKey('pkcs8', key.privateKey)).toString('base64')}\n-----END PRIVATE KEY-----`;
  const items = merchantProducts([]).slice(0, 2);
  const fakeFetch = async (url, options) => {
    if (url === 'https://oauth2.googleapis.com/token') {
      const [header, payload, signature] = options.body.get('assertion').split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
      assert.equal(claims.iss, merchantServiceAccount);
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/content');
      assert.equal(claims.aud, url);
      assert.equal(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key.publicKey, Buffer.from(signature, 'base64url'), new TextEncoder().encode(`${header}.${payload}`)), true);
      return Response.json({ access_token: 'test-access-token' });
    }
    assert.equal(new URL(url).searchParams.get('dataSource'), 'accounts/123/dataSources/456');
    assert.equal(options.headers.authorization, 'Bearer test-access-token');
    return new Response('', { status: JSON.parse(options.body).offerId === items[0].offerId ? 200 : 429 });
  };
  const results = await syncMerchantProducts({ GOOGLE_MERCHANT_ACCOUNT_ID: '123', GOOGLE_MERCHANT_DATA_SOURCE_ID: '456', GOOGLE_MERCHANT_PRIVATE_KEY: pem }, items, fakeFetch);
  assert.deepEqual(results.map(({ ok, status }) => ({ ok, status })), [{ ok: true, status: 200 }, { ok: false, status: 429 }]);
});
