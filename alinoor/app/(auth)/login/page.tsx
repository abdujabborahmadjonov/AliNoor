'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) setMessage(error.message)
  }

  const checkProfileCompletion = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    
    if (!profile || !profile.full_name) {
      router.push('/complete-profile')
    } else {
      router.push('/')
    }
  }

  const signInWithEmail = async () => {
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else if (data.user) {
      await checkProfileCompletion(data.user.id)
    }
  }

  const handleSignUpClick = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      <main className="relative w-full max-w-md">
        <div className="absolute -inset-8 bg-gradient-to-r from-black/5 via-black/10 to-black/5 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-black">A</span>
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold text-center text-black mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 mb-10 font-light">
            Sign in to continue writing
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-black/20 hover:bg-black/5 hover:border-black/40 transition-all duration-300 mb-8 group shadow-sm hover:shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.4 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.6 3-2.4 5.6-5.1 7.3l7.9 6.1c4.6-4.3 6.6-10.6 6.6-17z"/>
              <path fill="#FBBC05" d="M10.5 28.4c-1-3-1-6.2 0-9.2l-7.9-6.1C-.8 17.8-.8 30.2 2.6 34.9l7.9-6.5z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.9-6.1c-2.2 1.5-5 2.4-7.3 2.4-6.2 0-11.6-3.9-13.5-9.4l-7.9 6.5C6.5 42.6 14.6 48 24 48z"/>
            </svg>

            <span className="font-semibold text-gray-700 group-hover:text-black transition-colors">
              Continue with Google
            </span>
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
            <span className="text-sm text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                       text-black placeholder:text-gray-400
                       focus:outline-none focus:border-black focus:shadow-lg
                       transition-all duration-300 bg-white/50"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                       text-black placeholder:text-gray-400
                       focus:outline-none focus:border-black focus:shadow-lg
                       transition-all duration-300 bg-white/50"
            />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={signInWithEmail}
              disabled={loading}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-semibold
                       hover:bg-gray-800 transition-all duration-300 disabled:opacity-50
                       shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Sign In
            </button>

            <button
              onClick={handleSignUpClick}
              type="button"
              className="flex-1 border border-black/20 py-4 rounded-2xl font-semibold
                       hover:bg-black/5 hover:border-black transition-all duration-300
                       shadow-sm hover:shadow-md"
            >
              Sign Up
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-black/10">
              <p className="text-sm text-center text-gray-600 font-medium">
                {message}
              </p>
            </div>
          )}

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors font-medium inline-flex items-center gap-2">
              <span>←</span>
              <span>Back home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
