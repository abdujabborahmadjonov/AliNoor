'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ Google Login
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) setMessage(error.message)
  }

  // ✅ Email Sign In
  const signInWithEmail = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.href = '/'
    }

    setLoading(false)
  }

  // ✅ Email Sign Up
  const signUpWithEmail = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created. You can now sign in.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <main className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-md">

        {/* Title */}
        <h1 className="text-4xl font-serif font-semibold text-center text-black">
          Alinoor
        </h1>
        <p className="text-center text-zinc-600 mt-2 mb-8">
          Sign in to continue writing
        </p>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-full
                     border border-zinc-300 hover:bg-zinc-100 transition mb-6"
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.4 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.6 3-2.4 5.6-5.1 7.3l7.9 6.1c4.6-4.3 6.6-10.6 6.6-17z"/>
            <path fill="#FBBC05" d="M10.5 28.4c-1-3-1-6.2 0-9.2l-7.9-6.1C-.8 17.8-.8 30.2 2.6 34.9l7.9-6.5z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.9-6.1c-2.2 1.5-5 2.4-7.3 2.4-6.2 0-11.6-3.9-13.5-9.4l-7.9 6.5C6.5 42.6 14.6 48 24 48z"/>
          </svg>

          <span className="font-medium text-zinc-900">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-sm text-zinc-500">or</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 border border-zinc-300 rounded-lg
                     text-zinc-900 placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-zinc-300 rounded-lg
                     text-zinc-900 placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={signInWithEmail}
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-full
                       hover:bg-zinc-800 transition disabled:opacity-50"
          >
            Sign In
          </button>

          <button
            onClick={signUpWithEmail}
            disabled={loading}
            className="flex-1 border border-zinc-300 py-3 rounded-full
                       hover:bg-zinc-100 transition disabled:opacity-50"
          >
            Sign Up
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm text-center mt-6 text-zinc-600">
            {message}
          </p>
        )}

        {/* Back */}
        <p className="text-sm text-center mt-8 text-zinc-500">
          ← <Link href="/" className="underline hover:text-black">Back home</Link>
        </p>
      </main>
    </div>
  )
}