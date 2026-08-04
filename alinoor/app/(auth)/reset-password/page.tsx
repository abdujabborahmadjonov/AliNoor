'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors'

// Two modes: without a session this page emails a recovery link; when the
// user arrives from that link (Supabase stores a session from the URL hash)
// it lets them set a new password.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setHasSession(true)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setHasSession(true)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setMessage('Please enter your email address.')
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setSent(true)
      setMessage(
        'Recovery link sent! Check your inbox and open the link on this device.'
      )
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <div className="bg-panel border border-line rounded-xl p-8 sm:p-10 shadow-card">
          <p className="microlabel text-center mb-3">alinoor</p>

          <h1 className="text-3xl font-medium text-center text-ink mb-2 tracking-tight">
            {hasSession ? 'Set a new password' : 'Reset password'}
          </h1>
          <p className="text-center text-mute text-sm mb-8">
            {hasSession
              ? 'Choose a new password for your account'
              : 'We’ll email you a recovery link'}
          </p>

          {hasSession ? (
            <form onSubmit={updatePassword}>
              <div className="mb-4">
                <label htmlFor="new-password" className="microlabel block mb-2">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="confirm-password" className="microlabel block mb-2">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50 mb-6"
              >
                {loading ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          ) : (
            <form onSubmit={sendLink}>
              <div className="mb-6">
                <label htmlFor="reset-email" className="microlabel block mb-2">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading || sent}
                className="w-full bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50 mb-6"
              >
                {loading ? 'Sending…' : sent ? 'Link sent' : 'Send recovery link'}
              </button>
            </form>
          )}

          {message && (
            <div className="mb-6 p-3.5 bg-panel2 rounded-lg border border-line">
              <p className="text-sm text-center text-ink3">{message}</p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-mute hover:text-ink transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
