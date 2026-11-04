import { useEffect, useState } from 'react'
import type { AuthState } from '@okta/okta-auth-js'
import { oktaAuth, startAuth } from './okta.ts'

export type Auth = {
  status: 'loading' | 'signedOut' | 'signedIn'
  name: string | null
  error: string | null
  signIn: () => void
  signOut: () => void
}

function nameFrom(state: AuthState): string | null {
  const claims = state.idToken?.claims
  return claims?.name ?? claims?.preferred_username ?? claims?.email ?? null
}

export function useAuth(): Auth {
  const [status, setStatus] = useState<Auth['status']>('loading')
  const [name, setName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const onChange = (state: AuthState) => {
      if (!live) return
      setStatus(state.isAuthenticated ? 'signedIn' : 'signedOut')
      setName(state.isAuthenticated ? nameFrom(state) : null)
    }
    oktaAuth.authStateManager.subscribe(onChange)
    startAuth().then((err) => {
      if (!live) return
      setError(err)
      const state = oktaAuth.authStateManager.getAuthState()
      if (state) onChange(state)
    })
    return () => {
      live = false
      oktaAuth.authStateManager.unsubscribe(onChange)
    }
  }, [])

  return {
    status,
    name,
    error,
    signIn: () => {
      setError(null)
      oktaAuth.signInWithRedirect().catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not start sign-in.')
      })
    },
    signOut: () => {
      oktaAuth.signOut().catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not sign out.')
      })
    },
  }
}
