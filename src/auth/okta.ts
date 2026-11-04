import { OktaAuth } from '@okta/okta-auth-js'

// Public values: an SPA uses PKCE and has no client secret.
// Override per environment with VITE_OKTA_ISSUER / VITE_OKTA_CLIENT_ID.
const issuer =
  import.meta.env.VITE_OKTA_ISSUER ?? 'https://integrator-8597893.okta.com/oauth2/default'
const clientId = import.meta.env.VITE_OKTA_CLIENT_ID ?? '0oa19hgcbxcQB4S52698'

export const CALLBACK_PATH = '/login/callback'

export const oktaAuth = new OktaAuth({
  issuer,
  clientId,
  redirectUri: `${window.location.origin}${CALLBACK_PATH}`,
  postLogoutRedirectUri: window.location.origin,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
})

let started: Promise<string | null> | null = null

/**
 * Finish a sign-in redirect if this page load is one, then start Okta's
 * token services. Runs once per page load (safe under StrictMode).
 * Resolves to an error message if the redirect failed, otherwise null.
 */
export function startAuth(): Promise<string | null> {
  started ??= (async () => {
    let error: string | null = null
    if (window.location.pathname === CALLBACK_PATH) {
      const params = new URLSearchParams(window.location.search)
      try {
        // Okta reports failures (e.g. access_denied) on the callback URL.
        const okta = params.get('error')
        if (okta) throw new Error(params.get('error_description') ?? okta)
        const { tokens } = await oktaAuth.token.parseFromUrl()
        oktaAuth.tokenManager.setTokens(tokens)
      } catch (err) {
        error = err instanceof Error ? err.message : 'Sign-in failed.'
      }
      window.history.replaceState(null, '', '/')
    }
    await oktaAuth.start()
    return error
  })()
  return started
}
