// OAuth authorize: shows an AliNoor sign-in page, checks the password with
// Supabase once, and sends the user back to the client with a short-lived
// sealed code holding their Supabase session.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../tools'
import { Req, Res, codeRedirect, parseClient, queryOf, readBody, seal } from '../oauth'

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const page = (
  p: Record<string, string>,
  clientHost: string,
  googleHref: string,
  error = ''
) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect AliNoor</title>
<style>
:root{--bg:#fafaf7;--panel:#fff;--ink:#1a1916;--ink3:#6a675e;--line:#e3e1da;--ember:#b34a3a}
@media (prefers-color-scheme:dark){:root{--bg:#16140f;--panel:#1c1a16;--ink:#f5f4ef;--ink3:#a8a397;--line:#2d2a24;--ember:#d97560}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,sans-serif;padding:16px}
form{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:28px}
h1{font-size:20px;margin:0 0 6px}p{color:var(--ink3);margin:0 0 20px;font-size:14px}
label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin:14px 0 6px}
input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--ink);font:inherit}
button{margin-top:20px;width:100%;padding:11px;border:0;border-radius:9px;background:var(--ink);color:var(--bg);font:inherit;font-weight:600;cursor:pointer}
.err{color:var(--ember);font-size:14px;margin-top:14px}.note{font-size:12px;margin-top:16px}
.google{display:block;text-align:center;padding:11px;border:1px solid var(--line);border-radius:9px;color:var(--ink);text-decoration:none;font-weight:600}
.or{display:flex;align-items:center;gap:10px;color:var(--ink3);font-size:12px;margin:18px 0 0}.or::before,.or::after{content:'';flex:1;border-top:1px solid var(--line)}
</style></head><body>
<form method="post">
<h1>Connect AliNoor</h1>
<p><strong>${esc(clientHost)}</strong> wants to read and edit your AliNoor daily schedule.</p>
<a class="google" href="${esc(googleHref)}">Continue with Google</a>
<div class="or">or with email</div>
${Object.entries(p).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')}
<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required>
<label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
${error ? `<div class="err">${esc(error)}</div>` : ''}
<button type="submit">Allow access</button>
</form></body></html>`

const PARAMS = ['response_type', 'client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method', 'scope', 'resource']

export default async function handler(req: Req, res: Res) {
  const src = req.method === 'POST' ? await readBody(req) : queryOf(req)
  const p: Record<string, string> = {}
  for (const k of PARAMS) if (typeof src[k] === 'string') p[k] = src[k]

  const fail = (status: number, msg: string) => {
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(msg)
  }

  // Never redirect anywhere the client didn't register.
  const client = p.client_id ? parseClient(p.client_id) : null
  if (!client) return fail(400, 'Unknown client_id.')
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri))
    return fail(400, 'redirect_uri was not registered for this client.')
  if (p.response_type !== 'code') return fail(400, 'Only response_type=code is supported.')
  if (!p.code_challenge || p.code_challenge_method !== 'S256')
    return fail(400, 'PKCE with S256 is required.')

  const clientHost = new URL(p.redirect_uri).host
  // Google sign-in runs on the website (/connect), which needs this request.
  const googleHref = `/connect/?r=${encodeURIComponent(
    seal({ t: 'pending', p, host: clientHost, iat: Date.now() })
  )}`
  const html = (error = '', status = 200) => {
    res.writeHead(status, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-frame-options': 'DENY',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    })
    res.end(page(p, clientHost, googleHref, error))
  }

  if (req.method !== 'POST') return html()

  const email = typeof src.email === 'string' ? src.email.trim() : ''
  const password = typeof src.password === 'string' ? src.password : ''
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) return html('That email and password didn’t match an AliNoor account.', 401)

  const location = codeRedirect(p, data.session)
  res.writeHead(302, { location, 'cache-control': 'no-store' })
  res.end()
}

