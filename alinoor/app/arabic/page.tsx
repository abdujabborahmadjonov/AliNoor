'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { ARABIC_GROUPS } from '@/lib/content'
import { loadStars, saveStars } from '@/lib/store'

export default function ArabicPage() {
  const [groupKey, setGroupKey] = useState(ARABIC_GROUPS[0].key)
  const [starred, setStarred] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setStarred(loadStars())
  }, [])

  const group = ARABIC_GROUPS.find((g) => g.key === groupKey)!

  const toggleStar = (ar: string) => {
    const next = { ...starred, [ar]: !starred[ar] }
    if (!next[ar]) delete next[ar]
    setStarred(next)
    saveStars(next)
  }

  return (
    <AppShell title="Arabic" subtitle="starter Qur'anic vocabulary">
      <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-8">
        {/* Mobile: horizontal group chips */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {ARABIC_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroupKey(g.key)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm border transition-colors ${
                g.key === groupKey
                  ? 'bg-ink text-bg border-ink'
                  : 'border-line text-ink2'
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>

        <div className="hidden md:block space-y-1">
          {ARABIC_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroupKey(g.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                g.key === groupKey
                  ? 'bg-panel border border-line text-ink font-medium shadow-card'
                  : 'text-ink3 hover:text-ink'
              }`}
            >
              <span className="truncate">{g.title}</span>
              <span className="font-mono text-[11px] text-faint">
                {g.words.length}
              </span>
            </button>
          ))}
          <p className="font-mono text-[10px] text-faint px-4 pt-4 leading-relaxed">
            ★ {Object.keys(starred).length} starred
          </p>
        </div>

        <div>
          <div className="mb-6 pb-4 border-b border-line">
            <h2 className="text-xl font-semibold text-ink">{group.title}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.words.map((w) => (
              <div
                key={w.ar}
                className="border-l-2 border-ink/40 bg-panel border border-line rounded-xl p-5 shadow-card relative"
              >
                <button
                  onClick={() => toggleStar(w.ar)}
                  aria-label="star word"
                  className={`absolute top-4 left-4 text-sm transition-colors ${
                    starred[w.ar] ? 'text-warn' : 'text-faint hover:text-mute'
                  }`}
                >
                  ★
                </button>
                <p dir="rtl" lang="ar" className="font-quran text-4xl leading-relaxed text-ink mb-3">
                  {w.ar}
                </p>
                <p className="font-mono text-[12px] text-mute">{w.tr}</p>
                <p className="text-sm text-ink2 mt-1">{w.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
