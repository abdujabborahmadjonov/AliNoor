'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { clearLocalData, cloudHydrate, setCloudUser } from '@/lib/store'

// Public pages save personal data too — /arabic stores starred vocabulary —
// but only AuthGate ever established who the signed-in user was. On those pages
// writes were therefore kept on the device and silently discarded by the next
// hydrate. Establishing the session once, app-wide, fixes that and means the
// gate no longer has to be the thing that owns it.
export default function SessionSync() {
  useEffect(() => {
    let alive = true

    const adopt = async (userId: string | null) => {
      if (!alive || !userId) return
      // Set before hydrating so an edit made during boot still uploads; the
      // per-key timestamps in cloudHydrate keep it from being overwritten.
      setCloudUser(userId)
      await cloudHydrate(userId)
    }

    // getSession reads the stored session without a network round-trip, so a
    // signed-in user is known almost immediately after boot.
    supabase.auth
      .getSession()
      .then(({ data }) => adopt(data.session?.user.id ?? null))
      .catch(() => {})

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return
      if (event === 'SIGNED_OUT') {
        setCloudUser(null)
        clearLocalData()
        return
      }
      adopt(session?.user.id ?? null)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return null
}
