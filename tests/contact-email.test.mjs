import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`;
const emailModule = moduleUrl(await readFile(new URL('../lib/contact-email.ts', import.meta.url), 'utf8'));
const { sendContactNotification } = await import(emailModule);
const config = { RESEND_API_KEY: 'test-only', CONTACT_EMAIL_FROM: 'Azzura <contact@example.com>' };
const contact = { id: 'test-id', name: '<Customer>', email: 'customer@example.com', message: '<script>hello</script>' };

test('notification uses fixed owner recipient, verified sender and customer reply-to', async () => {
  const status = await sendContactNotification(config, contact, async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers['idempotency-key'], 'contact/test-id');
    const body = JSON.parse(options.body);
    assert.deepEqual(body.to, ['ozan@ozzyazzura.ca']);
    assert.equal(body.from, config.CONTACT_EMAIL_FROM);
    assert.equal(body.reply_to, contact.email);
    assert.equal(body.html, undefined);
    assert.ok(body.text.includes(contact.message));
    return Response.json({ id: 'provider-id' });
  });
  assert.equal(status, 'accepted');
});

test('missing configuration never sends; failures and malformed success never claim acceptance', async () => {
  assert.equal(await sendContactNotification({}, contact, () => assert.fail('must not send')), 'unavailable');
  for (const send of [async () => new Response('secret error', { status: 403 }), async () => { throw new Error('timeout'); }, async () => Response.json({})]) {
    assert.equal(await sendContactNotification(config, contact, send), 'unavailable');
  }
});

async function route({ databaseFails = false } = {}) {
  const calls = [];
  globalThis.contactTest = {
    db: { prepare: () => ({ bind: () => ({}) }), batch: async () => { calls.push('save'); if (databaseFails) throw new Error('db'); } },
    notify: async () => { calls.push('notify'); return 'unavailable'; },
  };
  const source = (await readFile(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8'))
    .replace('import { getDatabase } from "@/lib/db";', 'const getDatabase = () => globalThis.contactTest.db;')
    .replace('import { env } from "cloudflare:workers";', 'const env = {};')
    .replace('import { sendContactNotification, type ContactEmailConfig } from "@/lib/contact-email";', 'const sendContactNotification = (...args) => globalThis.contactTest.notify(...args);');
  const { POST } = await import(moduleUrl(source));
  return { calls, post: body => POST(new Request('https://example.com/api/contact', { method: 'POST', body: JSON.stringify(body) })) };
}

test('saved messages survive email failure; database failure cannot send or claim success', async () => {
  let handler = await route();
  let response = await handler.post(contact);
  assert.deepEqual(await response.json(), { saved: true, notification: 'unavailable' });
  assert.deepEqual(handler.calls, ['save', 'notify']);
  handler = await route({ databaseFails: true });
  response = await handler.post(contact);
  assert.equal(response.status, 503);
  assert.deepEqual(handler.calls, ['save']);
});

test('malformed input and honeypot cause no storage or email side effects', async () => {
  const handler = await route();
  assert.equal((await handler.post({ ...contact, name: 123 })).status, 400);
  assert.equal((await handler.post({ ...contact, website: 'spam' })).status, 200);
  assert.deepEqual(handler.calls, []);
});
