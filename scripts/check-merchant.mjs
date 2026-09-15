import { readFile } from 'node:fs/promises';
import { sign, createPrivateKey } from 'node:crypto';

// The credential file remains outside the repository. Never log its contents.
const config = JSON.parse(await readFile(new URL('../config/merchant.json', import.meta.url), 'utf8'));
const file = process.argv[2];
const registrationEmail = process.argv[3];
if (!file) throw new Error('Usage: node scripts/check-merchant.mjs /absolute/path/to/service-account.json [admin-email-to-register]');
const credentials = JSON.parse(await readFile(file, 'utf8'));
if (credentials.type !== 'service_account' || credentials.client_email !== config.serviceAccountEmail || credentials.project_id !== config.projectId) {
  throw new Error('Credential identity does not match config/merchant.json.');
}
const key = createPrivateKey(credentials.private_key);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
  iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/content',
  aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
})}`;
const assertion = `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}`;
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', signal: AbortSignal.timeout(15000),
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
});
const auth = await response.json();
if (!response.ok || !auth.access_token) throw new Error(`Google authentication failed (HTTP ${response.status}).`);
console.log('Google service-account authentication succeeded.');
const headers = { authorization: `Bearer ${auth.access_token}`, 'content-type': 'application/json' };
if (registrationEmail) {
  const registration = await fetch(`https://merchantapi.googleapis.com/accounts/v1/accounts/${config.merchantAccountId}/developerRegistration:registerGcp`, {
    method: 'POST', headers, signal: AbortSignal.timeout(15000), body: JSON.stringify({ developerEmail: registrationEmail }),
  });
  const result = await registration.json();
  console.log(JSON.stringify({ step: 'registration', status: registration.status, result }));
  if (!registration.ok) process.exit(1);
}
const source = await fetch(`https://merchantapi.googleapis.com/datasources/v1/accounts/${config.merchantAccountId}/dataSources/${config.dataSourceId}`, { headers, signal: AbortSignal.timeout(15000) });
const result = await source.json();
console.log(JSON.stringify({ step: 'dataSource', status: source.status, result }));
if (!source.ok) process.exit(1);
if (result.input !== 'API' || !result.primaryProductDataSource) throw new Error('Expected a primary API product data source.');
const settings = result.primaryProductDataSource;
if ((settings.feedLabel && settings.feedLabel !== config.feedLabel) || (settings.contentLanguage && settings.contentLanguage !== config.contentLanguage)) {
  throw new Error('Data-source language or feed label does not match the store configuration.');
}
console.log('Merchant API data source verified. No products were modified.');
