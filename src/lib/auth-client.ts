'use client'

import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'

function getAuthBaseURL() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_APP_URL
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [twoFactorClient()],
})

export const { signIn, signOut, signUp } = authClient
