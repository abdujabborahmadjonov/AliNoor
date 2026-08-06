'use client'

import { useRef, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { BUKHARI_BOOKS } from '@/lib/bukhari'

type Hadith = {
  number: number
  en: string
  ar: string
  grades: string
}

const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'

// The mirror 404s on numbers that fall in the gaps between books.
const okJson = async (r: Response) => {
  if (!r.ok) throw new Error(`hadith-api ${r.status}`)
  return r.json()
}

// A single hadith is fetched only when its number is tapped.
const fetchOne = async (n: number): Promise<Hadith | null> => {
  try {
    const [en, ar] = await Promise.all([
      fetch(`${BASE}/eng-bukhari/${n}.json`).then(okJson),
      fetch(`${BASE}/ara-bukhari/${n}.json`).then(okJson),
    ])
    const e = en.hadiths?.[0]
    return {
      number: n,
      en: e?.text || '',
      ar: ar.hadiths?.[0]?.text || '',
      grades: (e?.grades || [])
        .map((g: any) => g.grade)
        .filter(Boolean)
        .join(', '),
    }
  } catch {
    return null
  }
}

// The numbering has gaps between books (520→522, 2383→2385, …), so a neighbour is the
// next number some book actually contains — and it may live in a different book.
const step = (n: number, dir: 1 | -1): { n: number; book: number } | null => {
  const i = BUKHARI_BOOKS.findIndex((b) => n >= b.first && n <= b.last)
  if (i === -1) return null
  const b = BUKHARI_BOOKS[i]
  const next = n + dir
  if (next >= b.first && next <= b.last) return { n: next, book: b.n }
  const nb = BUKHARI_BOOKS[i + dir]
  if (!nb) return null
  return { n: dir === 1 ? nb.first : nb.last, book: nb.n }
}

export default function HadithPage() {
  const [bookNo, setBookNo] = useState(1)
  const [open, setOpen] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [cache, setCache] = useState<Record<number, Hadith>>({})
  const [jump, setJump] = useState('')
  const pendingRef = useRef<number | null>(null)

  const book = BUKHARI_BOOKS.find((b) => b.n === bookNo)!
  const total = BUKHARI_BOOKS[BUKHARI_BOOKS.length - 1].last
  const openData = open ? cache[open] : null

  const numbers = Array.from(
    { length: book.last - book.first + 1 },
    (_, i) => book.first + i
  )

  const openOne = async (n: number) => {
    setOpen(n)
    if (cache[n]) {
      pendingRef.current = null
      setLoading(false)
      return
    }
    pendingRef.current = n
    setLoading(true)
    const h = await fetchOne(n)
    if (h) setCache((c) => ({ ...c, [n]: h }))
    // A newer tap owns the loading state now.
    if (pendingRef.current !== n) return
    pendingRef.current = null
    setLoading(false)
  }

  const go = (t: { n: number; book: number } | null) => {
    if (!t) return
    setBookNo(t.book)
    openOne(t.n)
  }

  const jumpTo = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(jump, 10)
    if (!n || n < 1 || n > total) return
    const b = BUKHARI_BOOKS.find((x) => n >= x.first && n <= x.last)
    if (!b) return
    setBookNo(b.n)
    openOne(n)
    setJump('')
  }

  return (
    <AppShell
      title="Sahih al-Bukhari"
      subtitle={`all 97 books · ${total.toLocaleString()} hadith · tap a number to load it`}
    >
      <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-8">
        {/* Mobile: book dropdown */}
        <div className="md:hidden">
          <label className="microlabel block mb-2">Book</label>
          <select
            value={bookNo}
            onChange={(e) => {
              setBookNo(Number(e.target.value))
              setOpen(null)
            }}
            className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
          >
            {BUKHARI_BOOKS.map((b) => (
              <option key={b.n} value={b.n}>
                {b.n}. {b.title} · {b.last - b.first + 1}
              </option>
            ))}
          </select>
        </div>

        {/* BOOK LIST (desktop) */}
        <div className="hidden md:block space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
          {BUKHARI_BOOKS.map((b) => (
            <button
              key={b.n}
              onClick={() => {
                setBookNo(b.n)
                setOpen(null)
              }}
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

        {/* BOOK VIEW */}
        <div>
          <div className="mb-6 pb-4 border-b border-line">
            <h2 className="text-xl font-semibold text-ink">
              {book.n}. {book.title}
            </h2>
            <p className="font-mono text-[11px] text-mute mt-1">
              hadith {book.first}–{book.last}
            </p>
            <form onSubmit={jumpTo} className="mt-4 flex gap-2">
              <input
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                inputMode="numeric"
                placeholder={`Jump to hadith № (1–${total})`}
                className="w-full max-w-[240px] px-4 py-2 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-ink text-bg rounded-lg text-sm font-medium"
              >
                Go
              </button>
            </form>
          </div>

          {/* Number chips — nothing downloads until one is tapped */}
          <div className="flex flex-wrap gap-1.5 mb-6 max-h-[36vh] overflow-y-auto pr-1">
            {numbers.map((n) => (
              <button
                key={n}
                onClick={() => openOne(n)}
                className={`min-w-[52px] px-2 py-1.5 rounded-lg border font-mono text-[12px] transition-colors ${
                  open === n
                    ? 'bg-ink text-bg border-ink'
                    : cache[n]
                      ? 'border-linestrong text-ink2 hover:text-ink'
                      : 'border-line text-mute hover:border-linestrong hover:text-ink'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {open && (
            <div className="border-l-2 border-catedu/60 bg-panel border border-line rounded-xl p-6 shadow-card">
              {loading && !openData ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : openData ? (
                <>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <p className="font-mono text-[12px] text-mute uppercase tracking-widest">
                      Bukhari · {openData.number}
                      {openData.grades && (
                        <span className="normal-case tracking-normal italic text-faint">
                          {'  '}— {openData.grades}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => go(step(open, -1))}
                        disabled={!step(open, -1)}
                        className="px-2.5 py-1.5 rounded-lg border border-line font-mono text-[11px] text-ink3 hover:text-ink disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => go(step(open, 1))}
                        disabled={!step(open, 1)}
                        className="px-2.5 py-1.5 rounded-lg border border-line font-mono text-[11px] text-ink3 hover:text-ink disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <p className="text-[15px] leading-relaxed text-ink2 whitespace-pre-wrap">
                      {openData.en}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-arabic text-xl leading-[2.2] text-ink"
                    >
                      {openData.ar}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-mute py-4">
                  Couldn&apos;t load this hadith — tap it again to retry.
                </p>
              )}
            </div>
          )}

          {!open && (
            <p className="font-hand text-2xl text-mute">
              tap a hadith number above — only that one is downloaded
            </p>
          )}

          <p className="font-mono text-[10px] text-faint mt-8">
            Public-domain texts via the open hadith-api mirror
          </p>
        </div>
      </div>
    </AppShell>
  )
}
