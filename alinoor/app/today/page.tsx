'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import AuthGate from '@/app/components/AuthGate'
import { findCity } from '@/lib/cities'
import { countdown, fmtTime, maghribDay } from '@/lib/prayer'
import {
  AppSettings,
  Task,
  dateInTz,
  loadSettings,
  loadTasks,
  saveTasks,
  uid,
} from '@/lib/store'

function PageInner() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(new Date())
  const [addingAfter, setAddingAfter] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setSettings(loadSettings())
    setTasks(loadTasks())
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const day = useMemo(
    () => (settings ? maghribDay(settings, now) : null),
    [settings, now]
  )

  if (!settings || !day) {
    return (
      <AppShell title="Today">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </AppShell>
    )
  }

  const city = findCity(settings.city)
  const today = dateInTz(city.tz, now)
  const dayTasks = tasks.filter((t) => t.date === today)

  const persist = (next: Task[]) => {
    setTasks(next)
    saveTasks(next)
  }

  const addTask = (anchor: string) => {
    if (!draft.trim()) return
    persist([
      ...tasks,
      { id: uid(), date: today, anchor, title: draft.trim(), done: false },
    ])
    setDraft('')
    setAddingAfter(null)
  }

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: city.tz,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now)

  return (
    <AppShell title="Today" subtitle={`${dateLabel} · ${city.name}`}>
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* TIMELINE */}
        <div className="space-y-1">
          {day.sequence.map((p) => {
            const isNow = day.current.name === p.name
            const anchorTasks = dayTasks.filter((t) => t.anchor === p.name)
            return (
              <div key={`${p.name}${p.time.getTime()}`}>
                <div
                  className={`flex items-center gap-4 bg-panel border rounded-xl px-5 py-3.5 shadow-card ${
                    isNow ? 'border-ember/50' : 'border-line'
                  }`}
                >
                  <span className="font-medium text-ink w-20">{p.name}</span>
                  <span className="font-mono text-[13px] text-ink3">
                    {fmtTime(p.time, city.tz)}
                  </span>
                  {isNow && (
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-widest text-ember">
                      now
                    </span>
                  )}
                </div>

                {/* Tasks anchored after this prayer */}
                <div className="ml-6 my-1 space-y-1">
                  {anchorTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-4 py-2 bg-panel2/60 border border-line rounded-lg"
                    >
                      <button
                        onClick={() =>
                          persist(
                            tasks.map((x) =>
                              x.id === t.id ? { ...x, done: !x.done } : x
                            )
                          )
                        }
                        aria-label="toggle task"
                        className={`w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
                          t.done
                            ? 'bg-good border-good'
                            : 'border-linestrong hover:border-ink3'
                        }`}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          t.done ? 'text-mute line-through' : 'text-ink2'
                        }`}
                      >
                        {t.title}
                      </span>
                      <button
                        onClick={() =>
                          persist(tasks.filter((x) => x.id !== t.id))
                        }
                        className="text-faint hover:text-ember text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {addingAfter === p.name ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        addTask(p.name)
                      }}
                      className="flex gap-2"
                    >
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Task…"
                        className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-panel text-ink placeholder:text-faint focus:outline-none focus:border-linestrong"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-ink text-bg rounded-lg text-xs font-medium"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingAfter(null)}
                        className="px-3 py-2 border border-line rounded-lg text-xs text-ink3"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingAfter(p.name)
                        setDraft('')
                      }}
                      className="w-full text-left px-4 py-2 border border-dashed border-line rounded-lg font-mono text-[11px] text-faint hover:text-mute hover:border-linestrong transition-colors"
                    >
                      + add task after {p.name}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* NEXT PRAYER */}
        <div className="space-y-5">
          <div className="bg-panel border border-line rounded-xl p-6 shadow-card">
            <p className="microlabel mb-1">now · {day.current.name}</p>
            <p className="microlabel mb-4">next · {day.next.name}</p>
            <p className="text-4xl font-semibold text-ink tracking-tight">
              {countdown(day.next.time, now)}
            </p>
            <p className="font-mono text-[12px] text-mute mt-1">
              at {fmtTime(day.next.time, city.tz)}
            </p>
          </div>

          <div className="bg-panel border border-line rounded-xl p-6 shadow-card">
            <p className="microlabel mb-3">today&apos;s progress</p>
            <p className="text-sm text-ink3">
              {dayTasks.filter((t) => t.done).length} of {dayTasks.length} tasks
              done
            </p>
            <p className="font-hand text-xl text-mute mt-3">
              the day runs Maghrib to Maghrib
            </p>
          </div>
        </div>
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
