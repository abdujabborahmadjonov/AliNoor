'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { QURAN_THEMES } from '@/lib/content'

type Ayah = {
  ref: string
  surahName: string
  ar: string
  en: string
}

// Verse text comes from the alquran.cloud API at runtime: the Uthmani Arabic
// text plus the public-domain Pickthall translation.
const fetchAyah = async (ref: string): Promise<Ayah | null> => {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.pickthall`
    )
    const json = await res.json()
    const [ar, en] = json.data
    return {
      ref,
      surahName: ar.surah.englishName,
      ar: ar.text,
      en: en.text,
    }
  } catch {
    return null
  }
}

export default function QuranPage() {
  const [themeKey, setThemeKey] = useState(QURAN_THEMES[0].key)
  const [ayat, setAyat] = useState<Ayah[]>([])
  const [loading, setLoading] = useState(true)

  const theme = QURAN_THEMES.find((t) => t.key === themeKey)!

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all(theme.refs.map(fetchAyah)).then((results) => {
      if (!alive) return
      setAyat(results.filter(Boolean) as Ayah[])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [themeKey, theme.refs])

  return (
    <AppShell title="Quran" subtitle="ayat to live by">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        {/* THEME LIST */}
        <div className="space-y-1">
          {QURAN_THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setThemeKey(t.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                t.key === themeKey
                  ? 'bg-panel border border-line text-ink font-medium shadow-card'
                  : 'text-ink3 hover:text-ink'
              }`}
            >
              <span className="truncate">{t.title}</span>
              <span className="font-mono text-[11px] text-faint">
                {t.refs.length}
              </span>
            </button>
          ))}
          <p className="font-mono text-[10px] text-faint px-4 pt-4 leading-relaxed">
            Arabic text + Pickthall translation via alquran.cloud
          </p>
        </div>

        {/* AYAT */}
        <div>
          <div className="mb-6 pb-4 border-b border-line">
            <h2 className="text-xl font-semibold text-ink">{theme.title}</h2>
            <p className="text-sm text-ink3 mt-1">{theme.blurb}</p>
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          <div className="space-y-4">
            {!loading &&
              ayat.map((a) => (
                <div
                  key={a.ref}
                  className="border-l-2 border-ember/60 bg-panel border border-line rounded-xl p-6 shadow-card"
                >
                  <p className="font-mono text-[12px] text-mute mb-4">
                    {a.ref} · {a.surahName}
                  </p>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-2xl leading-loose text-ink mb-4"
                  >
                    {a.ar}
                  </p>
                  <p className="text-[15px] leading-relaxed text-ink2">
                    {a.en}
                  </p>
                </div>
              ))}
            {!loading && ayat.length === 0 && (
              <p className="text-sm text-mute py-8">
                Couldn&apos;t load verses — check your connection and try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
