// Hosted AliNoor MCP endpoint (Streamable HTTP, stateless) for claude.ai and
// other remote MCP clients. Requests carry the user's Supabase access token,
// obtained through the OAuth flow in api/oauth/.
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, createAliNoorServer } from '../tools'
import { Req, Res, json, origin, readBody } from '../oauth'

export default async function handler(req: Req, res: Res) {
  const unauthorized = (why: string) =>
    json(res, 401, { error: 'invalid_token', error_description: why }, {
      'www-authenticate': `Bearer resource_metadata="${origin(req)}/.well-known/oauth-protected-resource"`,
    })

  const auth = String(req.headers.authorization || '')
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) return unauthorized('Sign in to AliNoor to use this connector.')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return unauthorized('Session expired. Reconnect AliNoor.')
  const uid = data.user.id

  if (req.method !== 'POST')
    return json(res, 405, { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null })

  const server = createAliNoorServer(supabase, async () => uid)
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  res.on('close', () => {
    transport.close()
    server.close()
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, await readBody(req))
}
