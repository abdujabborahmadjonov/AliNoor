'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cloudHydrate, setCloudUser } from '@/lib/store'

// Wraps the sections that save personal data (Today, Habits, Learning,
// Statistics, Settings): requires a signed-in user and hydrates their synced
// data before the page mounts, so laptop and phone always agree.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true

    supabase.auth.getUser().then(async ({ data }) => {
      if (!alive) return
      if (!data.user) {
        setCloudUser(null)
        router.replace('/login')
        return
      }
      await cloudHydrate(data.user.id)
      if (alive) setReady(true)
    })

    return () => {
      alive = false
    }
  }, [router])

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
