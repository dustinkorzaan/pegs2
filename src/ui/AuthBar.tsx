import { useAuth } from '../auth/useAuth.ts'

export function AuthBar() {
  const auth = useAuth()

  return (
    <div className="auth-bar">
      {auth.error ? (
        <span className="auth-error" role="alert">
          {auth.error}
        </span>
      ) : null}
      {auth.status === 'signedIn' ? (
        <>
          {auth.name ? <span className="auth-name">{auth.name}</span> : null}
          <button type="button" className="button secondary auth-button" onClick={auth.signOut}>
            Sign out
          </button>
        </>
      ) : null}
      {auth.status === 'signedOut' ? (
        <button type="button" className="button secondary auth-button" onClick={auth.signIn}>
          Sign in
        </button>
      ) : null}
    </div>
  )
}
