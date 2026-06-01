-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
--
-- Why: NEXT_PUBLIC_SUPABASE_ANON_KEY is a public env var (prefix NEXT_PUBLIC_).
-- Without RLS, anyone who extracts that key from the browser bundle can query
-- the database directly and read all rows.
--
-- Strategy: enable RLS on every table with NO permissive policies for anon/
-- authenticated roles. All application queries use createAdminClient() with the
-- service role key, which bypasses RLS entirely — so app behaviour is unchanged.
-- The anon key (and JWT-authenticated Clerk tokens hitting Supabase directly)
-- will see zero rows on every table.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers  ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created. By default Postgres denies all access
-- when RLS is enabled and no policy allows the operation.
-- Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS — API routes unaffected.

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- Run this after applying the migration; all four should return "RLS: on"
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity
-- FROM   pg_tables
-- WHERE  schemaname = 'public'
--   AND  tablename IN ('users','product_registrations','warranty_records','ownership_transfers');
