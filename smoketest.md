Smoketest checklist — what's left:

  - Clerk — sign-up, sign-in, sign-out. Then check the webhook: register a new user and confirm a row appears in Supabase users table (that's the most fragile integration
   point)
  - Registration form — go through all 3 steps, confirm a row lands in product_registrations
  - Serial validation stub — /api/serial-validate should return the stub response without 500ing
  - Cloudinary upload — hit /api/upload-signature and confirm you get back signed params
  - Resend — if you have a test registration, trigger sendRegistrationConfirmation and verify email arrives
  - Warranty card page — /[locale]/warranty/[id] renders without crashing