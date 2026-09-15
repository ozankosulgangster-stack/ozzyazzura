# Google Merchant integration

Uses Merchant API v1 with `azzura-merchant-sync@azzura-merchant-integration.iam.gserviceaccount.com`. The email alone does not activate synchronization.

The credential-free account configuration is in `config/merchant.json`: account `5849769477`, data source `10724457938`, Cloud project `azzura-merchant-integration` (`66451850456`). The downloaded service-account JSON must remain outside the repository; its private key belongs only in hosting secrets.

Validate the downloaded key and API access without uploading products:

```sh
node scripts/check-merchant.mjs /absolute/path/to/downloaded-key.json
```

If Google returns `GCP_NOT_REGISTERED`, a Merchant administrator must register the Cloud project. The script optionally accepts the existing human administrator's email as a second argument to call `developerRegistration:registerGcp`; this assigns the API developer contact role. The service account making that call needs Merchant administrator permission. After successful registration, allow up to five minutes and run the read-only check again. Do not use the service-account email as the human developer contact.

## Activation

1. Enable Merchant API in the Google Cloud project, complete Google's developer registration, and grant the service account access to the Merchant Center account.
2. Select a primary **API** data source for English products with feed label CA. Verify/claim ozzyazzura.ca and configure shipping in Merchant Center.
3. Set server-side hosting values: `GOOGLE_MERCHANT_ACCOUNT_ID` (numeric), `GOOGLE_MERCHANT_DATA_SOURCE_ID` (numeric), `GOOGLE_MERCHANT_PRIVATE_KEY` (PKCS#8 PEM, actual or escaped newlines), and `MERCHANT_SYNC_TOKEN` (random secret, at least 32 characters). Never commit keys or tokens.
4. Apply D1 migration `0002_superb_ultragirl.sql` and enter actual opening counts at `/admin/inventory` using the configured `ADMIN_EMAIL` account. All 25 product/colour SKUs start at zero. Until counted, checkout and Google listings show sold out.
5. Deploy, preview the catalogue, then trigger sync. A GitHub push alone does not deploy the Sites-hosted website.

## Endpoints

Both require `Authorization: Bearer <MERCHANT_SYNC_TOKEN>`:

- `GET /api/merchant/products`: current Merchant-formatted offers, CAD prices, colour variants, product landing links and availability. No customer records, internal stock counts or credentials.
- `POST /api/merchant/sync`: upload all offers from authoritative store data. No caller-supplied product data is accepted. Returns submitted/failed counts and per-offer HTTP statuses. Partial failure returns 502; retries replace the same offer IDs. Inventory/authentication failure returns 503. Invalid or missing bearer token returns 401.

The service account authenticates outgoing Google requests; website endpoints use the separate bearer token, not an email header. Existing admin routes rely on Sites stripping/injecting identity headers; do not expose the Worker outside that trusted dispatcher.

Sync is on demand. Configure a trusted scheduler to POST periodically (for example every 15 minutes) and after catalogue changes. This code does not create a scheduler or live Google data source. Google processes uploads asynchronously; successful upload does not guarantee approval. Review Merchant Center diagnostics and category-specific identifier requirements. No GTINs or manufacturer part numbers are invented. Retired offers must be removed in Merchant Center when removed from the catalogue. Shipping/tax/account settings are managed separately.

Stock reservations are transactional: payment deducts once and signed checkout expiry releases holds. Enable `checkout.session.expired` on the Stripe webhook. Uncertain checkout creation retains stock for reconciliation; investigate before releasing any hold. Refunds do not automatically restock goods.

References: [Product uploads](https://developers.google.com/merchant/api/reference/rest/products_v1/accounts.productInputs/insert), [API data sources](https://developers.google.com/merchant/api/guides/data-sources/api-sources), [Service-account OAuth](https://developers.google.com/identity/protocols/oauth2/service-account).
