'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { clearLocalData, cloudHydrate, setCloudUser } from '@/lib/store'

// Wraps the sections that save personal data (Today, Habits, Learning,
// Statistics, Settings): requires a signed-in user and hydrates their synced
// data before the page mounts, so laptop and phone always agree.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true

    const enter = async () => {
      setFailed(false)
      const { data, error } = await supabase.auth.getUser()
      if (!alive) return

      // getUser() hits the network, so an offline user gets {user: null} too.
      // Only a clean "no user" means signed out; otherwise fall back to the
      // locally stored session rather than bouncing them to /login.
      let user = data.user
      if (!user && error) {
        const { data: local } = await supabase.auth.getSession()
        if (!alive) return
        user = local.session?.user ?? null
        if (!user) {
          setFailed(true)
          return
        }
      }

      if (!user) {
        setCloudUser(null)
        router.replace('/login')
        return
      }

      const { ok } = await cloudHydrate(user.id)
      if (!alive) return
      if (!ok) {
        setFailed(true)
        return
      }
      setReady(true)
    }

    enter()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return
      if (event === 'SIGNED_OUT' || !session) {
        setCloudUser(null)
        clearLocalData()
        setReady(false)
        router.replace('/login')
      }
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [router, attempt])

  if (failed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-ink font-semibold mb-2">Couldn’t reach your data</p>
          <p className="text-sm text-ink3 mb-6">
            We didn’t load this account’s tasks and habits, so we’re not showing
            anything yet — that way nothing already saved gets overwritten.
          </p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="px-5 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-[11px] text-mute uppercase tracking-widest">
            syncing your data
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
