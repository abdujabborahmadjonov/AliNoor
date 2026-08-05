'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import AuthGate from '@/app/components/AuthGate'
import { CITIES, findCity } from '@/lib/cities'
import { supabase } from '@/lib/supabase'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from '@/lib/store'

const METHODS: Array<{ value: AppSettings['method']; label: string }> = [
  { value: 'MuslimWorldLeague', label: 'Muslim World League' },
  { value: 'ISNA', label: 'ISNA (North America)' },
  { value: 'Egyptian', label: 'Egyptian General Authority' },
  { value: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { value: 'Karachi', label: 'University of Karachi' },
]

function PageInner() {
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const city = findCity(settings.city)

  return (
    <AppShell title="Settings" subtitle="account preferences">
      <div className="space-y-6 max-w-3xl">
        {saved && (
          <p className="font-mono text-[11px] text-good uppercase tracking-widest">
            saved
          </p>
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

export default function GatedPage() {
  return (
    <AuthGate>
      <PageInner />
    </AuthGate>
  )
}
