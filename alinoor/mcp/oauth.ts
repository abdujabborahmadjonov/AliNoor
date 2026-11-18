// Minimal OAuth 2.1 for the hosted MCP endpoint, so claude.ai can add AliNoor
// as a connector. It is stateless: the authorization code and refresh token
// are AES-GCM sealed with MCP_SECRET, and the access token is the user's own
// Supabase access token, so row-level security still decides what it can read.
// The user's password is checked once on the login page and never stored.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'

export type Req = IncomingMessage & {
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}
export type Res = ServerResponse

// How long a sign-in code may wait before the client trades it for tokens.
export const CODE_TTL_MS = 5 * 60 * 1000

const key = () => {
  const secret = process.env.MCP_SECRET
  if (!secret || secret.length < 32)
    throw new Error('MCP_SECRET is not set on this deployment.')
  return createHash('sha256').update(secret).digest()
}

const b64url = (b: Buffer) => b.toString('base64url')

export const seal = (payload: object) => {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key(), iv)
  const body = Buffer.concat([c.update(JSON.stringify(payload), 'utf8'), c.final()])
  return b64url(Buffer.concat([iv, c.getAuthTag(), body]))
}

export const unseal = <T>(token: string): T | null => {
  try {
    const raw = Buffer.from(token, 'base64url')
    const d = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12))
    d.setAuthTag(raw.subarray(12, 28))
    const out = Buffer.concat([d.update(raw.subarray(28)), d.final()])
    return JSON.parse(out.toString('utf8')) as T
  } catch {
    return null
  }
}

export const s256 = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url')

// The public origin the request came in on (alinoor.uz, a preview URL, …).
export const origin = (req: Req) => {
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  return `${proto.split(',')[0]}://${host}`
}

export const json = (res: Res, status: number, body: unknown, headers: Record<string, string> = {}) => {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(JSON.stringify(body))
}

// Form or JSON body, whichever the platform already parsed or left raw.
export const readBody = async (req: Req): Promise<Record<string, string>> => {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, string>
  let raw = typeof req.body === 'string' ? req.body : ''
  if (!raw) for await (const chunk of req) raw += chunk
  const type = String(req.headers['content-type'] || '')
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw || '{}')
    } catch {
      return {}
    }
  }
  return Object.fromEntries(new URLSearchParams(raw))
}

// Query string, whether or not the platform already parsed it.
export const queryOf = (req: Req): Record<string, string> => ({
  ...Object.fromEntries(new URL(req.url || '/', 'http://x').searchParams),
  ...Object.fromEntries(
    Object.entries(req.query || {}).flatMap(([k, v]) =>
      typeof v === 'string' ? [[k, v]] : []
    )
  ),
})

// Dynamic client registration: the client id carries the redirect URIs it may
// use, sealed so it can't be edited to add a new one.
export type Client = { redirect_uris: string[]; name?: string }

export const parseClient = (clientId: string) => unseal<Client>(clientId)

export const metadata = (base: string) => ({
  issuer: base,
  authorization_endpoint: `${base}/api/oauth/authorize`,
  token_endpoint: `${base}/api/oauth/token`,
  registration_endpoint: `${base}/api/oauth/register`,
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
  scopes_supported: ['schedule'],
})

export const resourceMetadata = (base: string) => ({
  resource: `${base}/api/mcp`,
  authorization_servers: [base],
  scopes_supported: ['schedule'],
  bearer_methods_supported: ['header'],
  resource_name: 'AliNoor',
})

// A validated authorize request, sealed so the Google sign-in detour through
// the website can carry it without anyone editing where the code goes.
export type PendingAuth = {
  t: 'pending'
  p: Record<string, string>
  host: string
  iat: number
}

export const PENDING_TTL_MS = 15 * 60 * 1000

export type Session = { access_token: string; refresh_token: string; expires_at?: number }

// The client's redirect URI with a sealed, short-lived code for this session.
export const codeRedirect = (p: Record<string, string>, session: Session) => {
  const code = seal({
    t: 'code',
    at: session.access_token,
    rt: session.refresh_token,
    exp: session.expires_at,
    cc: p.code_challenge,
    ru: p.redirect_uri,
    cid: p.client_id,
    iat: Date.now(),
  })
  const back = new URL(p.redirect_uri)
  back.searchParams.set('code', code)
  if (p.state) back.searchParams.set('state', p.state)
  return back.toString()
}
