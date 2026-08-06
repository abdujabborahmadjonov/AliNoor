'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { adhanUrl } from '@/lib/adhan-audio'
import { timesFor } from '@/lib/prayer'
import { findCity } from '@/lib/cities'
import { dateInTz, loadSettings } from '@/lib/store'
import type { AdhanPrayer } from '@/lib/store'

// How long after a prayer time the adhan may still start. Short enough that a
// tab opened hours later stays silent, long enough to survive a slow load.
const WINDOW_MS = 2 * 60 * 1000
const LAST_KEY = 'alinoor_adhan_last'

export default function AdhanPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [blocked, setBlocked] = useState(false)
  const pendingRef = useRef<string | null>(null)

  const play = useCallback((voice: string) => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = adhanUrl(voice)
    audio.currentTime = 0
    const started = audio.play()
    if (started) {
      // Autoplay is refused until the page has been interacted with, so offer
      // the user a way to start it rather than failing silently.
      started.then(
        () => setBlocked(false),
        () => setBlocked(true)
      )
    }
  }, [])

  useEffect(() => {
    let alive = true

    const tick = () => {
      if (!alive) return
      const settings = loadSettings()
      if (!settings.adhanEnabled) return

      const city = findCity(settings.city)
      const now = new Date()
      const today = dateInTz(city.tz, now)
      const times = timesFor(settings, now)

      for (const p of times) {
        if (p.name === 'Sunrise') continue
        if (!settings.adhanPrayers[p.name as AdhanPrayer]) continue

        const delta = now.getTime() - p.time.getTime()
        if (delta < 0 || delta >= WINDOW_MS) continue

        const key = `${today}-${p.name}`
        let last: string | null = null
        try {
          last = window.localStorage.getItem(LAST_KEY)
        } catch {}
        if (last === key) continue

        try {
          window.localStorage.setItem(LAST_KEY, key)
        } catch {}
        pendingRef.current = settings.adhanVoice
        play(settings.adhanVoice)
        return
      }
    }

    tick()
    const timer = setInterval(tick, 15_000)
    document.addEventListener('visibilitychange', tick)

    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
      audioRef.current?.pause()
    }
  }, [play])

  return (
    <>
      <audio ref={audioRef} preload="none" />
      {blocked && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-panel border border-linestrong rounded-xl px-4 py-3 shadow-card">
          <span className="text-sm text-ink2">
            It&apos;s time for the adhan — your browser blocked the sound.
          </span>
          <button
            onClick={() => play(pendingRef.current || loadSettings().adhanVoice)}
            className="px-3 py-1.5 bg-ink text-bg rounded-lg text-sm font-medium"
          >
            Play
          </button>
          <button
            onClick={() => setBlocked(false)}
            className="text-faint hover:text-ink text-sm"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
