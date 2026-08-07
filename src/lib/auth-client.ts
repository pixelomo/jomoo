'use client'

import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, twoFactorClient } from 'better-auth/client/plugins'
// Type-only, so the server config does not reach the client bundle. It teaches
// the client about the columns declared in auth.ts's additionalFields, which is
// what lets signUp.email accept the address and name fields the form collects.
import type { auth } from '@/lib/auth'

function getAuthBaseURL() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_APP_URL
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [twoFactorClient(), inferAdditionalFields<typeof auth>()],
})

export const { signIn, signOut, signUp } = authClient
