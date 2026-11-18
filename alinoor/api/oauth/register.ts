// OAuth dynamic client registration (RFC 7591), stateless.
import { Req, Res, json, readBody, seal } from '../../mcp/oauth'

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const body = (await readBody(req)) as unknown as {
    redirect_uris?: unknown
    client_name?: unknown
  }
  const uris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.filter((u): u is string => typeof u === 'string' && /^https:\/\/|^http:\/\/localhost[:/]/.test(u))
    : []
  if (uris.length === 0)
    return json(res, 400, { error: 'invalid_redirect_uri', error_description: 'redirect_uris must be https URLs' })
  const name = typeof body.client_name === 'string' ? body.client_name.slice(0, 100) : undefined
  return json(res, 201, {
    client_id: seal({ redirect_uris: uris, name }),
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: uris,
    client_name: name,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  })
}
