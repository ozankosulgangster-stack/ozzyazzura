# Contact enquiry notifications

The contact endpoint saves each enquiry before attempting a Resend notification to
`ozan@ozzyazzura.ca`. The customer email is Reply-To, never the sending address.
Only plain text is sent. Missing configuration, provider rejection, and timeout
leave the saved enquiry intact and return a warning with a direct-email fallback.
Provider acceptance means queued, not confirmed inbox delivery.

## Activation

1. In the owner's Resend account, verify a sending domain (a dedicated subdomain
   is suitable). Add only the exact verification records Resend supplies to
   GoDaddy; preserve Microsoft 365 MX and existing email records.
2. Store `RESEND_API_KEY` as a server-only hosting secret and set
   `CONTACT_EMAIL_FROM` to a sender on that verified domain. Never use a
   `NEXT_PUBLIC_`/`VITE_` variable or commit the key.
3. Deploy the server application. This repository currently uses Cloudflare
   bindings; its existing static Netlify deployment cannot execute this endpoint.
   Netlify runtime/database/authentication migration remains a separate prerequisite.
4. Submit an explicitly authorized test enquiry, confirm the saved admin record,
   check the provider's delivery status and the GoDaddy inbox, and verify Reply-To.

Existing enquiries are not emailed retrospectively. Unavailable notifications are
logged with only the record ID; inspect `/admin/contacts` to recover them. There is
no automatic retry queue in this version. Resend requests carry an idempotency key
based on the saved record ID. A new form submission is a new enquiry.

References: https://resend.com/docs/api-reference/emails/send-email
and https://resend.com/docs/dashboard/emails/idempotency-keys
