import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  // max:1 is the standard recommendation for serverless (Vercel) environments
  // to avoid exhausting Railway's connection limit
  const client = postgres(url, { max: 1 })
  return drizzle(client, { schema })
}

// Lazy singleton — initialised on first use, not at import time
let _db: ReturnType<typeof getDb> | null = null

export function getDatabase() {
  if (!_db) _db = getDb()
  return _db
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return (getDatabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
