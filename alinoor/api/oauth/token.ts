// OAuth token endpoint: trades a sealed code (with PKCE) or a sealed refresh
// token for the user's Supabase access token, refreshing it with Supabase.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../mcp/tools'
import { CODE_TTL_MS, Req, Res, json, readBody, s256, seal, unseal } from '../../mcp/oauth'

type Code = { t: 'code'; at: string; rt: string; exp?: number; cc: string; ru: string; cid: string; iat: number }
type Refresh = { t: 'refresh'; rt: string; cid: string }

const tokens = (at: string, rt: string, cid: string, exp?: number) => ({
  access_token: at,
  token_type: 'Bearer',
  expires_in: exp ? Math.max(60, exp - Math.floor(Date.now() / 1000)) : 3600,
  refresh_token: seal({ t: 'refresh', rt, cid } satisfies Refresh),
  scope: 'schedule',
})

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'invalid_request' })
  const b = await readBody(req)
  const bad = (error: string, error_description: string) =>
    json(res, 400, { error, error_description })

  if (b.grant_type === 'authorization_code') {
    const c = b.code ? unseal<Code>(b.code) : null
    if (!c || c.t !== 'code') return bad('invalid_grant', 'Unknown code.')
    if (Date.now() - c.iat > CODE_TTL_MS) return bad('invalid_grant', 'Code expired.')
    if (b.redirect_uri && b.redirect_uri !== c.ru) return bad('invalid_grant', 'redirect_uri mismatch.')
    if (b.client_id && b.client_id !== c.cid) return bad('invalid_grant', 'client_id mismatch.')
    if (!b.code_verifier || s256(b.code_verifier) !== c.cc)
      return bad('invalid_grant', 'PKCE verification failed.')
    return json(res, 200, tokens(c.at, c.rt, c.cid, c.exp))
  }

  if (b.grant_type === 'refresh_token') {
    const r = b.refresh_token ? unseal<Refresh>(b.refresh_token) : null
    if (!r || r.t !== 'refresh') return bad('invalid_grant', 'Unknown refresh token.')
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: r.rt })
    if (error || !data.session)
      return bad('invalid_grant', 'Session expired. Reconnect AliNoor.')
    return json(res, 200, tokens(data.session.access_token, data.session.refresh_token, r.cid, data.session.expires_at))
  }

  return bad('unsupported_grant_type', 'Use authorization_code or refresh_token.')
}
