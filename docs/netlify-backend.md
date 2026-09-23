# Netlify backend migration

Migration branch: `codex/netlify-backend`. DNS must remain unchanged until hosted validation and final data reconciliation pass.

Next.js builds to `.next`; Netlify's Next.js adapter supplies the server functions. The Turso libSQL adapter preserves SQLite stock triggers and uses atomic write batches. Incoming `oai-authenticated-user-*` headers no longer grant access. Google OAuth sessions identify customers; `ADMIN_EMAIL` restricts administration to the owner.

## Server environment

- `TURSO_DATABASE_URL` and secret `TURSO_AUTH_TOKEN`: the empty destination database.
- `RESEND_API_KEY` and `CONTACT_EMAIL_FROM`: verified Resend sender.
- `NEXTAUTH_URL`: exact deployment origin (use a stable Netlify URL for testing; change to the canonical domain at cutover).
- `NEXTAUTH_SECRET`: cryptographically random secret of at least 32 bytes.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Google OAuth web application credentials, distinct from the Merchant service account. Register `<NEXTAUTH_URL>/api/auth/callback/google` as an authorized redirect URI.
- `ADMIN_EMAIL`: the owner's verified Google account email.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`: matching Stripe environment and endpoint `/api/stripe/webhook`; use test mode in a separate preview environment.
- Preserve the existing Google Merchant account/data-source configuration and server-only private key and sync token.

Do not give arbitrary deploy previews access to the production database. Netlify production settings currently contain the Turso URL/token; Google OAuth and webhook configuration still need verification.

## Import

Run `npm run db:import -- /absolute/path/to/private-backup` with Turso credentials in a secure local environment. Never run this during a build. The importer verifies checksums, refuses nonempty destinations, restores and compares every row in a transaction, and creates stock-changing triggers after records. No opening-stock seed is run. Legacy customer identities cause an explicit stop until a mapping is provided.

The September 20 backup has eight application tables and 60 rows, no customer accounts or orders with legacy identities. It is not an atomic snapshot. Re-export/reconcile new orders, inventory, contacts and subscribers during a controlled cutover; account for in-flight Stripe sessions. Do not accept orders on two independently stocked databases.

## Validation

`npm test` covers catalogue, Merchant, contact notification failure behaviour and stock transactions through libSQL. `npm run test:production` checks rendered pages, rejected forged identity headers and cross-origin writes. Validate real OAuth, Stripe test checkout/payment/expiry, email receipt and Merchant landing pages on Netlify before DNS cutover. Keep Microsoft 365 DNS records and the old database intact for rollback.
