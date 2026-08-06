'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import { CITIES, findCity } from '@/lib/cities'
import { supabase } from '@/lib/supabase'
import { ADHAN_VOICES, adhanUrl } from '@/lib/adhan-audio'
import {
  ADHAN_PRAYERS,
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  onSyncStatus,
  saveSettings,
  signOutAndClear,
} from '@/lib/store'

const METHODS: Array<{ value: AppSettings['method']; label: string }> = [
  { value: 'MuslimWorldLeague', label: 'Muslim World League' },
  { value: 'ISNA', label: 'ISNA (North America)' },
  { value: 'Egyptian', label: 'Egyptian General Authority' },
  { value: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { value: 'Karachi', label: 'University of Karachi' },
]

export default function PageInner() {
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [syncFailed, setSyncFailed] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const previewRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setSettings(loadSettings())
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    return onSyncStatus(setSyncFailed)
  }, [])

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  // Previewing doubles as the gesture that lets the browser play audio later,
  // so the adhan itself isn't the first sound the page ever tries to make.
  const togglePreview = () => {
    let audio = previewRef.current
    if (!audio) {
      audio = new Audio()
      audio.addEventListener('ended', () => setPreviewing(false))
      previewRef.current = audio
    }
    if (previewing) {
      audio.pause()
      setPreviewing(false)
      return
    }
    audio.src = adhanUrl(settings.adhanVoice)
    audio.currentTime = 0
    audio
      .play()
      .then(() => setPreviewing(true))
      .catch(() => setPreviewing(false))
  }

  useEffect(
    () => () => {
      previewRef.current?.pause()
      previewRef.current = null
    },
    []
  )

  const logout = async () => {
    await signOutAndClear()
    router.push('/login')
  }

  const city = findCity(settings.city)

  return (
    <AppShell title="Settings" subtitle="account preferences">
      <div className="space-y-6 max-w-3xl">
        {syncFailed ? (
          <p className="font-mono text-[11px] text-ember uppercase tracking-widest">
            saved on this device only — sync is failing
          </p>
        ) : (
          saved && (
            <p className="font-mono text-[11px] text-good uppercase tracking-widest">
              saved
            </p>
          )
        )}

        {/* Account */}
        <section className="bg-panel border border-line rounded-xl p-6 shadow-card">
          <h2 className="font-semibold text-ink mb-5">Account</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="microlabel block mb-2">Display name</label>
              <input
                value={settings.displayName}
                onChange={(e) => update({ displayName: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
              />
            </div>
            <div>
              <label className="microlabel block mb-2">Email</label>
              <div className="px-4 py-2.5 border border-line rounded-lg bg-panel2 text-sm text-ink3 font-mono truncate">
                {user?.email || 'not signed in'}
              </div>
            </div>
          </div>
        </section>

        {/* Location & prayer */}
        <section className="bg-panel border border-line rounded-xl p-6 shadow-card">
          <h2 className="font-semibold text-ink mb-5">Location & prayer</h2>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="microlabel block mb-2">City</label>
              <select
                value={settings.city}
                onChange={(e) => update({ city: e.target.value })}
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} · {c.country}
                  </option>
                ))}
              </select>
              <p className="font-hand text-lg text-mute mt-2">
                {city.name}, {city.country} · {city.lat.toFixed(2)}°N ·{' '}
                {city.lng.toFixed(2)}°E
              </p>
            </div>
            <div>
              <label className="microlabel block mb-2">Timezone</label>
              <div className="px-4 py-2.5 border border-line rounded-lg bg-panel2 text-sm text-ink3 font-mono">
                {city.tz}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="microlabel block mb-2">Method</label>
              <select
                value={settings.method}
                onChange={(e) =>
                  update({ method: e.target.value as AppSettings['method'] })
                }
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="microlabel block mb-2">Madhhab</label>
            <div className="flex gap-2 items-center">
              {(['Hanafi', 'Shafi'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => update({ madhab: m })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    settings.madhab === m
                      ? 'bg-ink text-bg border-ink'
                      : 'border-line text-ink2 hover:border-linestrong'
                  }`}
                >
                  {m === 'Shafi' ? "Shafi'i / Maliki / Hanbali" : 'Hanafi'}
                </button>
              ))}
              <span className="font-hand text-lg text-warn ml-2">
                affects Asr time
              </span>
            </div>
          </div>
        </section>

        {/* Adhan */}
        <section className="bg-panel border border-line rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between gap-6 mb-5">
            <div>
              <h2 className="font-semibold text-ink mb-1">Adhan</h2>
              <p className="text-sm text-ink3 leading-relaxed max-w-md">
                Hear the call to prayer at its time, using the city and
                calculation method set above.
              </p>
            </div>
            <button
              onClick={() => update({ adhanEnabled: !settings.adhanEnabled })}
              role="switch"
              aria-checked={settings.adhanEnabled}
              aria-label="Play the adhan at prayer times"
              className={`flex-shrink-0 w-12 h-7 rounded-full border transition-colors relative ${
                settings.adhanEnabled
                  ? 'bg-ink border-ink'
                  : 'bg-panel2 border-line'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-bg transition-all ${
                  settings.adhanEnabled ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {settings.adhanEnabled && (
            <>
              <div className="mb-5">
                <label className="microlabel block mb-2">Muezzin</label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={settings.adhanVoice}
                    onChange={(e) => update({ adhanVoice: e.target.value })}
                    className="flex-1 min-w-[220px] px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
                  >
                    {ADHAN_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={togglePreview}
                    className="px-4 py-2.5 border border-line rounded-lg text-sm font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors"
                  >
                    {previewing ? '◼ Stop' : '▶ Preview'}
                  </button>
                </div>
              </div>

              <div>
                <label className="microlabel block mb-2">Call for</label>
                <div className="flex flex-wrap gap-2">
                  {ADHAN_PRAYERS.map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        update({
                          adhanPrayers: {
                            ...settings.adhanPrayers,
                            [p]: !settings.adhanPrayers[p],
                          },
                        })
                      }
                      aria-pressed={settings.adhanPrayers[p]}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        settings.adhanPrayers[p]
                          ? 'bg-ink text-bg border-ink'
                          : 'border-line text-ink3 hover:border-linestrong'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="font-hand text-lg text-mute mt-3">
                  plays while AliNoor is open in a tab — a browser can&apos;t
                  wake itself for the adhan
                </p>
              </div>
            </>
          )}
        </section>

        {/* Data note */}
        <section className="bg-panel border border-line rounded-xl p-6 shadow-card">
          <h2 className="font-semibold text-ink mb-2">Your data</h2>
          <p className="text-sm text-ink3 leading-relaxed">
            Tasks, habits, books, and these preferences are synced to your
            account — sign in on any device and they follow you. Essays live in
            Supabase too.
          </p>
        </section>

        {/* Sign out */}
        <section className="bg-panel border border-line rounded-xl p-6 shadow-card flex items-center justify-between gap-6">
          <div>
            <h2 className="font-semibold text-ink mb-1">Sign out</h2>
            <p className="text-sm text-ink3">
              End your session on this device. Your data stays put.
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2.5 border border-ember/40 text-ember rounded-lg text-sm font-medium hover:bg-ember/10 transition-colors flex-shrink-0"
          >
            Log out
          </button>
        </section>
      </div>
    </AppShell>
  )
}
