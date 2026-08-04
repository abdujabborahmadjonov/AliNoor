'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { HADITH_THEMES, HadithRef } from '@/lib/content'

type Hadith = {
  key: string
  collection: string
  number: number
  note: string
  en: string
  ar: string
}

const COLLECTION_LABEL: Record<string, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
}

// Text is fetched at runtime from the public-domain hadith-api CDN.
const fetchHadith = async (ref: HadithRef): Promise<Hadith | null> => {
  try {
    const base = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'
    const [en, ar] = await Promise.all([
      fetch(`${base}/eng-${ref.collection}/${ref.number}.json`).then((r) =>
        r.json()
      ),
      fetch(`${base}/ara-${ref.collection}/${ref.number}.json`).then((r) =>
        r.json()
      ),
    ])
    return {
      key: `${ref.collection}-${ref.number}`,
      collection: ref.collection,
      number: ref.number,
      note: ref.note,
      en: en.hadiths?.[0]?.text || '',
      ar: ar.hadiths?.[0]?.text || '',
    }
  } catch {
    return null
  }
}

export default function HadithPage() {
  const [themeKey, setThemeKey] = useState(HADITH_THEMES[0].key)
  const [items, setItems] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)

  const theme = HADITH_THEMES.find((t) => t.key === themeKey)!

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all(theme.refs.map(fetchHadith)).then((results) => {
      if (!alive) return
      setItems(results.filter(Boolean) as Hadith[])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [themeKey, theme.refs])

  return (
    <AppShell title="Sunnah" subtitle="hadith to live by — Bukhari & Muslim">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <div className="space-y-1">
          {HADITH_THEMES.map((t) => (
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
            Public-domain texts via the open hadith-api mirror
          </p>
        </div>

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
              items.map((h) => (
                <div
                  key={h.key}
                  className="border-l-2 border-catedu/60 bg-panel border border-line rounded-xl p-6 shadow-card"
                >
                  <p className="font-mono text-[12px] text-mute mb-4 uppercase tracking-widest">
                    {COLLECTION_LABEL[h.collection]} · {h.number}
                    <span className="normal-case tracking-normal italic text-faint">
                      {'  '}— {h.note}
                    </span>
                  </p>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <p className="text-[15px] leading-relaxed text-ink2 whitespace-pre-wrap">
                      {h.en}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-lg leading-loose text-ink"
                    >
                      {h.ar}
                    </p>
                  </div>
                </div>
              ))}
            {!loading && items.length === 0 && (
              <p className="text-sm text-mute py-8">
                Couldn&apos;t load hadith — check your connection and try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
