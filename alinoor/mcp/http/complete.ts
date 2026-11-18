// Finishes a connector sign-in that went through Google on the website.
// GET ?r=… names the app asking (for the consent screen on /connect).
// POST { r, access_token, refresh_token } checks the new Supabase session and
// returns the client's redirect URL carrying a sealed code.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../tools'
import {
  PENDING_TTL_MS,
  PendingAuth,
  Req,
  Res,
  codeRedirect,
  json,
  queryOf,
  readBody,
  unseal,
} from '../oauth'

const pendingFrom = (r: unknown) => {
  const pending = typeof r === 'string' ? unseal<PendingAuth>(r) : null
  if (!pending || pending.t !== 'pending') return null
  if (Date.now() - pending.iat > PENDING_TTL_MS) return null
  return pending
}

export default async function handler(req: Req, res: Res) {
  if (req.method === 'GET') {
    const pending = pendingFrom(queryOf(req).r)
    if (!pending) return json(res, 400, { error: 'This sign-in link expired. Start again from Claude.' })
    return json(res, 200, { host: pending.host })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })

  const b = await readBody(req)
  const pending = pendingFrom(b.r)
  if (!pending) return json(res, 400, { error: 'This sign-in link expired. Start again from Claude.' })
  if (!b.access_token || !b.refresh_token)
    return json(res, 400, { error: 'Missing session.' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(b.access_token)
  if (error || !data.user) return json(res, 401, { error: 'Google sign-in didn’t produce a valid AliNoor session.' })

  const exp = Number(b.expires_at)
  return json(res, 200, {
    redirect: codeRedirect(pending.p, {
      access_token: b.access_token,
      refresh_token: b.refresh_token,
      expires_at: Number.isFinite(exp) ? exp : undefined,
    }),
  })
}
