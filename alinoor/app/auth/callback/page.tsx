'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let finished = false
    let unsubscribe: (() => void) | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    const finish = async (userId: string) => {
      if (finished) return
      finished = true

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      router.replace(!profile || !profile.full_name ? '/complete-profile' : '/')
    }

    const run = async () => {
      const url = new URL(window.location.href)

      // Supabase reports OAuth failures via query params — surface them
      // instead of silently bouncing to /login.
      const errorDescription =
        url.searchParams.get('error_description') || url.searchParams.get('error')
      if (errorDescription) {
        setError(errorDescription)
        return
      }

      // PKCE flow: the provider redirected back with ?code= to exchange.
      const code = url.searchParams.get('code')
      if (code) {
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
        if (data.session?.user) {
          await finish(data.session.user.id)
          return
        }
      }

      // Implicit flow: the session arrives in the URL hash and supabase-js
      // stores it asynchronously — subscribe rather than reading it once.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) finish(session.user.id)
      })
      unsubscribe = () => sub.subscription.unsubscribe()

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await finish(session.user.id)
        return
      }

      // Give the token exchange a few seconds before giving up.
      timer = setTimeout(async () => {
        if (finished) return
        const { data: { session: late } } = await supabase.auth.getSession()
        if (late?.user) {
          await finish(late.user.id)
        } else {
          router.replace('/login')
        }
      }, 5000)
    }

    run()

    return () => {
      if (unsubscribe) unsubscribe()
      if (timer) clearTimeout(timer)
    }
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="microlabel mb-3">sign-in failed</p>
          <p className="text-sm text-ink3 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-mute">Signing you in…</p>
      </div>
    </div>
  )
}
