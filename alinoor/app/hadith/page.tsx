'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { BUKHARI_BOOKS } from '@/lib/bukhari'

type Hadith = {
  number: number
  en: string
  ar: string
  grades: string
}

const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'
const PAGE = 15

export default function HadithPage() {
  const [bookNo, setBookNo] = useState(1)
  const [items, setItems] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [query, setQuery] = useState('')

  const book = BUKHARI_BOOKS.find((b) => b.n === bookNo)!

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(false)
    setVisible(PAGE)
    Promise.all([
      fetch(`${BASE}/eng-bukhari/sections/${bookNo}.json`).then((r) => r.json()),
      fetch(`${BASE}/ara-bukhari/sections/${bookNo}.json`).then((r) => r.json()),
    ])
      .then(([en, ar]) => {
        if (!alive) return
        const arByNum = new Map<number, string>(
          (ar.hadiths || []).map((h: any) => [h.hadithnumber, h.text])
        )
        setItems(
          (en.hadiths || []).map((h: any) => ({
            number: h.hadithnumber,
            en: h.text || '',
            ar: arByNum.get(h.hadithnumber) || '',
            grades: (h.grades || [])
              .map((g: any) => g.grade)
              .filter(Boolean)
              .join(', '),
          }))
        )
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setError(true)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [bookNo])

  const filtered = query.trim()
    ? items.filter(
        (h) =>
          h.en.toLowerCase().includes(query.toLowerCase()) ||
          String(h.number).includes(query.trim())
      )
    : items

  return (
    <AppShell
      title="Sahih al-Bukhari"
      subtitle={`all 97 books · ${BUKHARI_BOOKS[BUKHARI_BOOKS.length - 1].last.toLocaleString()} hadith`}
    >
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* BOOK LIST */}
        <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
          {BUKHARI_BOOKS.map((b) => (
            <button
              key={b.n}
              onClick={() => setBookNo(b.n)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                b.n === bookNo
                  ? 'bg-panel border border-line text-ink font-medium shadow-card'
                  : 'text-ink3 hover:text-ink'
              }`}
            >
              <span className="font-mono text-[10px] text-faint w-6 flex-shrink-0">
                {b.n}
              </span>
              <span className="flex-1 truncate">{b.title}</span>
              <span className="font-mono text-[10px] text-faint flex-shrink-0">
                {b.last - b.first + 1}
              </span>
            </button>
          ))}
        </div>

        {/* HADITH LIST */}
        <div>
          <div className="mb-6 pb-4 border-b border-line">
            <h2 className="text-xl font-semibold text-ink">
              {book.n}. {book.title}
            </h2>
            <p className="font-mono text-[11px] text-mute mt-1">
              hadith {book.first}–{book.last}
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter this book by text or number…"
              className="mt-4 w-full max-w-sm px-4 py-2 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
            />
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {error && (
            <p className="text-sm text-mute py-8">
              Couldn&apos;t load this book — check your connection and try
              again.
            </p>
          )}

          <div className="space-y-4">
            {!loading &&
              !error &&
              filtered.slice(0, visible).map((h) => (
                <div
                  key={h.number}
                  className="border-l-2 border-catedu/60 bg-panel border border-line rounded-xl p-6 shadow-card"
                >
                  <p className="font-mono text-[12px] text-mute mb-4 uppercase tracking-widest">
                    Bukhari · {h.number}
                    {h.grades && (
                      <span className="normal-case tracking-normal italic text-faint">
                        {'  '}— {h.grades}
                      </span>
                    )}
                  </p>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <p className="text-[15px] leading-relaxed text-ink2 whitespace-pre-wrap">
                      {h.en}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-arabic text-xl leading-[2.2] text-ink"
                    >
                      {h.ar}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {!loading && !error && filtered.length > visible && (
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="mt-6 w-full py-3 border border-dashed border-linestrong rounded-xl font-mono text-[11px] text-mute hover:text-ink hover:border-ink3 transition-colors"
            >
              show more · {filtered.length - visible} remaining
            </button>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-mute py-8">No matches in this book.</p>
          )}

          <p className="font-mono text-[10px] text-faint mt-8">
            Public-domain texts via the open hadith-api mirror
          </p>
        </div>
      </div>
    </AppShell>
  )
}
