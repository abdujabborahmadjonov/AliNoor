'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { Book, loadBooks, saveBooks, uid } from '@/lib/store'

export default function LearningPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [pages, setPages] = useState('')

  useEffect(() => {
    setBooks(loadBooks())
  }, [])

  const persist = (next: Book[]) => {
    setBooks(next)
    saveBooks(next)
  }

  const addBook = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseInt(pages, 10)
    if (!title.trim() || !total || total < 1) return
    persist([
      ...books,
      {
        id: uid(),
        title: title.trim(),
        topic: topic.trim() || 'General',
        pagesTotal: total,
        pagesRead: 0,
      },
    ])
    setTitle('')
    setTopic('')
    setPages('')
    setAdding(false)
  }

  const bump = (id: string, by: number) => {
    persist(
      books.map((b) => {
        if (b.id !== id) return b
        const pagesRead = Math.min(b.pagesTotal, Math.max(0, b.pagesRead + by))
        return {
          ...b,
          pagesRead,
          finishedAt:
            pagesRead >= b.pagesTotal
              ? b.finishedAt || new Date().toISOString().slice(0, 10)
              : undefined,
        }
      })
    )
  }

  const reading = books.filter((b) => !b.finishedAt)
  const finished = books.filter((b) => b.finishedAt)

  const BookRow = ({ b }: { b: Book }) => {
    const pct = Math.round((b.pagesRead / b.pagesTotal) * 100)
    return (
      <div className="border-l-2 border-good pl-4 py-3 flex flex-wrap items-center gap-4">
        <div className="min-w-[180px] flex-1">
          <p className="font-medium text-ink">{b.title}</p>
          <p className="font-mono text-[11px] text-mute mt-1">
            <span className="px-1.5 py-0.5 border border-line rounded-md mr-2">
              {b.topic}
            </span>
            {b.pagesRead} / {b.pagesTotal}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36 h-1.5 bg-panel2 rounded-full overflow-hidden">
            <div
              className="h-full bg-good rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-mute w-9">{pct}%</span>
          {!b.finishedAt &&
            [1, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => bump(b.id, n)}
                className="px-2.5 py-1 border border-line rounded-lg font-mono text-[11px] text-ink3 hover:border-linestrong hover:text-ink transition-colors"
              >
                +{n}
              </button>
            ))}
          <button
            onClick={() => persist(books.filter((x) => x.id !== b.id))}
            className="text-faint hover:text-ember text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell title="Learning · knowledge" subtitle="books">
      <div className="bg-panel border border-line rounded-xl p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-ink">
            Currently reading{' '}
            <span className="font-mono text-[12px] text-mute font-normal">
              {reading.length} {reading.length === 1 ? 'book' : 'books'}
            </span>
          </p>
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2 border border-line rounded-lg text-sm font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors"
          >
            + Add book
          </button>
        </div>

        {adding && (
          <form onSubmit={addBook} className="flex flex-wrap items-end gap-3 py-4 border-b border-line">
            <div className="flex-1 min-w-[160px]">
              <label className="microlabel block mb-2">Title</label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
              />
            </div>
            <div>
              <label className="microlabel block mb-2">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Islam"
                className="w-28 px-3 py-2 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
              />
            </div>
            <div>
              <label className="microlabel block mb-2">Pages</label>
              <input
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                inputMode="numeric"
                placeholder="240"
                className="w-20 px-3 py-2 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-ink text-bg rounded-lg text-sm font-medium">
              Save
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-2 border border-line rounded-lg text-sm text-ink3"
            >
              Cancel
            </button>
          </form>
        )}

        {reading.length === 0 && !adding && (
          <p className="py-8 text-center text-sm text-mute">
            Add a book to start tracking pages, progress, and finished reads.
          </p>
        )}

        <div className="divide-y divide-line">
          {reading.map((b) => (
            <BookRow key={b.id} b={b} />
          ))}
        </div>
      </div>

      {finished.length > 0 && (
        <div className="bg-panel border border-line rounded-xl p-6 shadow-card">
          <p className="font-semibold text-ink mb-2">
            Finished{' '}
            <span className="font-mono text-[12px] text-mute font-normal">
              {finished.length}
            </span>
          </p>
          <div className="divide-y divide-line">
            {finished.map((b) => (
              <div key={b.id} className="py-3 flex items-center gap-4">
                <span className="text-good">✓</span>
                <span className="font-medium text-ink flex-1">{b.title}</span>
                <span className="font-mono text-[11px] text-mute">
                  {b.pagesTotal} pages · {b.finishedAt}
                </span>
                <button
                  onClick={() => persist(books.filter((x) => x.id !== b.id))}
                  className="text-faint hover:text-ember text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
