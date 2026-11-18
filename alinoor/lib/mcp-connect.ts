// Google sign-in for the Claude connector. It uses its own Supabase client
// (PKCE, separate storage), so the connector gets a session of its own: sharing
// the website's would break both, since Supabase rotates refresh tokens and a
// reused one ends the whole session.
import { createClient } from '@supabase/supabase-js'

const PENDING_KEY = 'alinoor_mcp_connect'

export const connectClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        storageKey: 'alinoor-mcp-connect',
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

export const setPendingConnect = (r: string) => {
  try {
    window.sessionStorage.setItem(PENDING_KEY, r)
  } catch {}
}

export const takePendingConnect = () => {
  try {
    const r = window.sessionStorage.getItem(PENDING_KEY)
    window.sessionStorage.removeItem(PENDING_KEY)
    return r
  } catch {
    return null
  }
}

// After Google redirects back with ?code=, trade it for the connector's own
// session and send the browser back to Claude.
export const finishConnect = async (r: string, code: string | null) => {
  if (!code) throw new Error('Google didn’t send a sign-in code back.')
  const client = connectClient()
  const { data, error } = await client.auth.exchangeCodeForSession(code)
  // The session now belongs to the connector; don't keep a copy in this browser.
  try {
    window.localStorage.removeItem('alinoor-mcp-connect')
  } catch {}
  if (error || !data.session) throw new Error(error?.message || 'Google sign-in failed.')

  const res = await fetch('/api/oauth/complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      r,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.redirect) throw new Error(body.error || 'Couldn’t finish connecting.')
  window.location.href = body.redirect
}
