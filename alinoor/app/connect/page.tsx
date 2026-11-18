'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { connectClient, setPendingConnect } from '@/lib/mcp-connect'

// Consent screen for connecting Claude (or another MCP client) with Google.
// Reached from the connector's sign-in page; the sealed request `r` says which
// app asked and where to send the user back.
function Connect() {
  const r = useSearchParams().get('r') || ''
  const [host, setHost] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!r) return setError('This link is incomplete. Start again from Claude.')
    fetch(`/api/oauth/complete?r=${encodeURIComponent(r)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || 'This sign-in link expired.')
        setHost(body.host)
      })
      .catch((e) => setError(e.message))
  }, [r])

  const google = async () => {
    setBusy(true)
    setPendingConnect(r)
    const { error } = await connectClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-panel border border-line rounded-xl p-7 shadow-card">
        <h1 className="text-xl font-semibold text-ink mb-2">Connect AliNoor</h1>
        {error ? (
          <p className="text-sm text-ember">{error}</p>
        ) : !host ? (
          <p className="text-sm text-mute">Checking the request…</p>
        ) : (
          <>
            <p className="text-sm text-ink3 mb-6">
              <strong className="text-ink">{host}</strong> wants to read and
              edit your AliNoor daily schedule.
            </p>
            <button
              onClick={google}
              disabled={busy}
              className="w-full py-2.5 bg-ink text-bg rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {busy ? 'Opening Google…' : 'Continue with Google'}
            </button>
            <p className="font-mono text-[11px] text-faint mt-4">
              Only allow apps you trust. You can remove the connector in Claude
              at any time.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConnectPage() {
  return (
    <Suspense>
      <Connect />
    </Suspense>
  )
}
