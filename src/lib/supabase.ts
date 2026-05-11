import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return url
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  return key
}

// Lazy singleton — browser / server-component client (anon key, RLS applies)
let _supabase: SupabaseClient | null = null
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getAnonKey())
  }
  return _supabase
}

// Backward-compat named export (initialised on first use)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Server-side admin client (service role key, bypasses RLS — use only in API routes)
export function createAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
