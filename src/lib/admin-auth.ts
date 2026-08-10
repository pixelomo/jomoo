import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_session'
const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

/**
 * Admin roles, least to most privileged.
 *
 * The portal used to be one shared login that could do everything. Exporting
 * the member list and deleting records are the two actions that cannot be
 * undone from inside the portal, so they are the two that a role can withhold:
 * an operator can run the serial library day to day without being able to walk
 * out with the database or erase evidence of a mistake.
 */
export const ADMIN_ROLES = ['operator', 'manager', 'owner'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminPermission = 'export' | 'delete'

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  operator: [],
  manager: ['export'],
  owner: ['export', 'delete'],
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  operator: 'Operator',
  manager: 'Manager',
  owner: 'Owner',
}

export interface AdminSession {
  username: string
  role: AdminRole
}

export function can(session: AdminSession | null, permission: AdminPermission): boolean {
  return Boolean(session && ROLE_PERMISSIONS[session.role].includes(permission))
}

/** Permissions as a plain object, for handing to client components. */
export function permissionsOf(session: AdminSession | null) {
  return {
    export: can(session, 'export'),
    delete: can(session, 'delete'),
  }
}

function getSecret() {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('BETTER_AUTH_SECRET not configured')
  return new TextEncoder().encode(s + ':admin')
}

interface AdminAccount {
  username: string
  password: string
  role: AdminRole
}

/**
 * ADMIN_USERNAME / ADMIN_PASSWORD stay the owner account so nothing that was
 * working needs reconfiguring. Extra staff go in ADMIN_ACCOUNTS as
 * `username:password:role` entries separated by newlines or commas:
 *
 *   ADMIN_ACCOUNTS="ops:s3cret:operator,reception:hunter2:manager"
 *
 * An entry naming a role that does not exist is dropped rather than defaulted —
 * a typo must not quietly hand someone the owner's delete button.
 */
function adminAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = []

  const owner = process.env.ADMIN_USERNAME
  const ownerPassword = process.env.ADMIN_PASSWORD
  if (owner && ownerPassword) {
    accounts.push({ username: owner, password: ownerPassword, role: 'owner' })
  }

  for (const entry of (process.env.ADMIN_ACCOUNTS ?? '').split(/[\n,]+/)) {
    const [username, password, role] = entry.trim().split(':')
    if (!username || !password) continue
    if (!ADMIN_ROLES.includes(role as AdminRole)) {
      console.error(`[admin] ignoring account "${username}" — unknown role "${role ?? ''}"`)
      continue
    }
    accounts.push({ username, password, role: role as AdminRole })
  }

  return accounts
}

/**
 * Comparison that does not return early on the first differing character, so
 * the response time cannot be used to guess a password one letter at a time.
 * Written by hand rather than with node:crypto so this module stays usable
 * from any runtime.
 */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i % (b.length || 1))
  }
  return diff === 0
}

export function authenticateAdmin(username: string, password: string): AdminSession | null {
  let matched: AdminAccount | null = null
  // Every account is checked even after a hit, so the number of comparisons
  // does not reveal where in the list an account sits.
  for (const account of adminAccounts()) {
    if (safeEqual(account.username, username) && safeEqual(account.password, password)) {
      matched = account
    }
  }
  return matched ? { username: matched.username, role: matched.role } : null
}

export async function signAdminToken(session: AdminSession): Promise<string> {
  return new SignJWT({ role: session.role, username: session.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const role = payload.role
    // Tokens issued before roles existed carry role:'admin' and belong to the
    // single shared login, which is now the owner.
    if (role === 'admin') return { username: 'admin', role: 'owner' }
    if (typeof role !== 'string' || !ADMIN_ROLES.includes(role as AdminRole)) return null
    return {
      username: typeof payload.username === 'string' ? payload.username : 'admin',
      role: role as AdminRole,
    }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TTL_SECONDS,
  }
}
