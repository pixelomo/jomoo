RESEND_FROM_EMAIL=onboarding@resend.dev is Resend's test address — in test mode emails only reach verified addresses in your Resend dashboard, not real users. Required action before go-live: add and verify a custom domain in resend.com/domains, then update RESEND_FROM_EMAIL in Vercel environment variables (e.g. noreply@jomoo.jp). Also add NEXT_PUBLIC_APP_URL=https://your-domain.com to env vars so warranty card links in emails work.

----

   Smoketest checklist — what's left:

  - Clerk — sign-up, sign-in, sign-out. Then check the webhook: register a new user and confirm a row appears in Supabase users table (that's the most fragile integration
   point)
  - Registration form — go through all 3 steps, confirm a row lands in product_registrations
  - Serial validation stub — /api/serial-validate should return the stub response without 500ing
  - Cloudinary upload — hit /api/upload-signature and confirm you get back signed params
  - Resend — if you have a test registration, trigger sendRegistrationConfirmation and verify email arrives
  - Warranty card page — /[locale]/warranty/[id] renders without crashing

  ---
  Barcode scanning for autofill — feasibility note:
  
  The idea is solid, but the serial number data dependency is the blocking question. Two realistic paths:

  1. Barcode → product model lookup (simpler, achievable now) — scan a barcode, decode the UPC/EAN, call a product database (Open Food Facts for consumer goods, or a paid
   API like Digit-Eyes / UPCitemdb) to autofill product model/name fields. You already have the serial validation stub in serialValidation.ts — this would be a sibling
  concern.
  2. Barcode → serial number verification (requires client data) — if the manufacturer encodes serial numbers in barcodes/QR codes on their own products, you'd need them
  to provide a lookup table or extend the CRM endpoint. The SERIAL_VALIDATION_ENDPOINT env var is already architected for exactly this.

  The camera/scan piece itself is straightforward — @zxing/browser or html5-qrcode work well in Next.js and are mobile-friendly. The scan would decode the barcode value
  and pipe it directly into the Step 2 serial number field.

  My recommendation: park the barcode feature for Phase 2 and confirm with the client whether their product barcodes contain the serial number or just a model code — that
   answer determines which path above is viable. The scan UI itself is a small addition once that's settled.


Resend — go to resend.com, sign up:
  1. API Keys → Create API key → name it jomoo → copy it
  2. For the from address: use onboarding@resend.dev now (Resend's sandbox, no domain required). You'll swap this for a real domain address before going live.