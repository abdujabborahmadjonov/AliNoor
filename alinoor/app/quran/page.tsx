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

type SurahInfo = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

const API = 'https://api.alquran.cloud/v1'

// Verse text loads at runtime: Uthmani Arabic + the public-domain Pickthall
// translation, via alquran.cloud.
const fetchAyah = async (ref: string): Promise<Ayah | null> => {
  try {
    const res = await fetch(
      `${API}/ayah/${ref}/editions/quran-uthmani,en.pickthall`
    )
    const json = await res.json()
    const [ar, en] = json.data
    return { ref, surahName: ar.surah.englishName, ar: ar.text, en: en.text }
  } catch {
    return null
  }
}

export default function QuranPage() {
  const [mode, setMode] = useState<'themes' | 'surahs'>('themes')

  // themes state
  const [themeKey, setThemeKey] = useState(QURAN_THEMES[0].key)
  const [ayat, setAyat] = useState<Ayah[]>([])
  const [themeLoading, setThemeLoading] = useState(true)

  // surah state
  const [surahs, setSurahs] = useState<SurahInfo[]>([])
  const [surahNo, setSurahNo] = useState(1)
  const [surahAyat, setSurahAyat] = useState<Array<{ n: number; ar: string; en: string }>>([])
  const [surahLoading, setSurahLoading] = useState(false)

  const theme = QURAN_THEMES.find((t) => t.key === themeKey)!
  const surah = surahs.find((s) => s.number === surahNo)

  useEffect(() => {
    let alive = true
    setThemeLoading(true)
    Promise.all(theme.refs.map(fetchAyah)).then((results) => {
      if (!alive) return
      setAyat(results.filter(Boolean) as Ayah[])
      setThemeLoading(false)
    })
    return () => {
      alive = false
    }
  }, [themeKey, theme.refs])

  useEffect(() => {
    fetch(`${API}/surah`)
      .then((r) => r.json())
      .then((j) => setSurahs(j.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (mode !== 'surahs') return
    let alive = true
    setSurahLoading(true)
    fetch(`${API}/surah/${surahNo}/editions/quran-uthmani,en.pickthall`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return
        const [ar, en] = j.data
        setSurahAyat(
          ar.ayahs.map((a: any, i: number) => ({
            n: a.numberInSurah,
            ar: a.text,
            en: en.ayahs[i]?.text || '',
          }))
        )
        setSurahLoading(false)
      })
      .catch(() => {
        if (alive) setSurahLoading(false)
      })
    return () => {
      alive = false
    }
  }, [mode, surahNo])

  const Tabs = (
    <div className="flex gap-2 mb-8">
      {(
        [
          ['themes', 'Ayat to live by'],
          ['surahs', 'All surahs'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            mode === key
              ? 'bg-ink text-bg border-ink'
              : 'border-line text-ink2 hover:border-linestrong'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <AppShell title="Quran" subtitle="recitation & reflection">
      {Tabs}

      {mode === 'themes' && (
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
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

          <div>
            <div className="mb-6 pb-4 border-b border-line">
              <h2 className="text-xl font-semibold text-ink">{theme.title}</h2>
              <p className="text-sm text-ink3 mt-1">{theme.blurb}</p>
            </div>

            {themeLoading && (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            <div className="space-y-4">
              {!themeLoading &&
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
                      className="font-quran text-3xl leading-[2.4] text-ink mb-4"
                    >
                      {a.ar}
                    </p>
                    <p className="text-[15px] leading-relaxed text-ink2">
                      {a.en}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'surahs' && (
        <div className="grid md:grid-cols-[260px_1fr] gap-8">
          <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
            {surahs.map((s) => (
              <button
                key={s.number}
                onClick={() => setSurahNo(s.number)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  s.number === surahNo
                    ? 'bg-panel border border-line text-ink font-medium shadow-card'
                    : 'text-ink3 hover:text-ink'
                }`}
              >
                <span className="font-mono text-[10px] text-faint w-6">
                  {s.number}
                </span>
                <span className="flex-1 truncate">{s.englishName}</span>
                <span dir="rtl" lang="ar" className="font-quran text-base text-ink3">
                  {s.name.replace('سُورَةُ ', '')}
                </span>
              </button>
            ))}
            {surahs.length === 0 && (
              <p className="text-sm text-mute px-3 py-4">Loading surahs…</p>
            )}
          </div>

          <div>
            {surah && (
              <div className="mb-6 pb-4 border-b border-line flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {surah.number}. {surah.englishName}
                    <span className="text-ink3 font-normal">
                      {' '}
                      · {surah.englishNameTranslation}
                    </span>
                  </h2>
                  <p className="font-mono text-[11px] text-mute mt-1">
                    {surah.numberOfAyahs} ayat · {surah.revelationType}
                  </p>
                </div>
                <span dir="rtl" lang="ar" className="font-quran text-2xl text-ink">
                  {surah.name}
                </span>
              </div>
            )}

            {surahLoading && (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            <div className="space-y-3">
              {!surahLoading &&
                surahAyat.map((a) => (
                  <div
                    key={a.n}
                    className="bg-panel border border-line rounded-xl p-5 shadow-card"
                  >
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-quran text-[26px] leading-[2.4] text-ink mb-3"
                    >
                      {a.ar}{' '}
                      <span className="text-ember text-lg">﴿{a.n}﴾</span>
                    </p>
                    <p className="text-sm leading-relaxed text-ink3">{a.en}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
