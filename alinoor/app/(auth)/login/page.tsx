'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Supabase error strings are terse — translate the common ones.
const friendlyError = (message: string) => {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (m.includes('email not confirmed')) {
    return 'Your email isn’t confirmed yet — check your inbox for the verification link.'
  }
  if (m.includes('missing email') || m.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }
  return message
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const signInWithGoogle = async () => {
    setMessage(null)
    setGoogleLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/callback`,
      },
    })

    // On success the browser navigates away; we only get here on failure.
    if (error) {
      setMessage(friendlyError(error.message))
      setGoogleLoading(false)
    }
  }

  const checkProfileCompletion = async (userId: string) => {
    // Fail open: a transient lookup failure must not push a user whose profile
    // is already complete back through the "tell us about you" form. The
    // complete-profile route re-checks anyway.
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, country, phone, age')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        router.push('/')
        return
      }

      const complete =
        profile &&
        profile.full_name &&
        profile.country &&
        profile.phone &&
        profile.age

      router.push(complete ? '/' : '/complete-profile')
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) {
      setMessage(friendlyError(error.message))
      setLoading(false)
    } else if (data.user) {
      await checkProfileCompletion(data.user.id)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <div className="bg-panel border border-line rounded-xl p-8 sm:p-10 shadow-card">
          <p className="microlabel text-center mb-3">alinoor</p>

          <h1 className="text-3xl font-medium text-center text-ink mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-center text-mute text-sm mb-8">
            Sign in to continue writing
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-line hover:border-linestrong bg-panel transition-colors mb-6 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.4 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.6 3-2.4 5.6-5.1 7.3l7.9 6.1c4.6-4.3 6.6-10.6 6.6-17z"/>
              <path fill="#FBBC05" d="M10.5 28.4c-1-3-1-6.2 0-9.2l-7.9-6.1C-.8 17.8-.8 30.2 2.6 34.9l7.9-6.5z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.9-6.1c-2.2 1.5-5 2.4-7.3 2.4-6.2 0-11.6-3.9-13.5-9.4l-7.9 6.5C6.5 42.6 14.6 48 24 48z"/>
            </svg>
            <span className="text-sm font-medium text-ink2">
              {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
            </span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-line" />
            <span className="font-mono text-[11px] text-faint uppercase">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <form onSubmit={signInWithEmail}>
            <div className="mb-4">
              <label htmlFor="login-email" className="microlabel block mb-2">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="microlabel">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="font-mono text-[11px] text-mute hover:text-ink transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors"
              />
            </div>

            <div className="flex gap-3 mb-6">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex-1 bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <Link
                href="/signup"
                className="flex-1 border border-line py-3 rounded-lg text-sm font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors text-center"
              >
                Sign up
              </Link>
            </div>
          </form>

          {message && (
            <div className="mb-6 p-3.5 bg-panel2 rounded-lg border border-line">
              <p className="text-sm text-center text-ink3">{message}</p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-mute hover:text-ink transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
