'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { planningDay } from '@/lib/prayer'
import {
  CATEGORIES,
  CATEGORY_DOT,
  CATEGORY_LABEL,
  Category,
  Habit,
  HabitLogs,
  addDays,
  loadHabitLogs,
  loadHabits,
  loadSettings,
  saveHabitLogs,
  saveHabits,
  uid,
} from '@/lib/store'

const GRID_DAYS = 60

export default function PageInner() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLogs>({})
  const [today, setToday] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('spiritual')

  useEffect(() => {
    setHabits(loadHabits())
    setLogs(loadHabitLogs())

    // Same day key Today uses, and re-read rather than frozen at mount: a tab
    // left open overnight would otherwise still mark yesterday's cell as today.
    const sync = () => setToday(planningDay(loadSettings()))
    sync()
    const t = setInterval(sync, 60_000)
    document.addEventListener('visibilitychange', sync)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  const days = useMemo(() => {
    if (!today) return []
    return Array.from({ length: GRID_DAYS }, (_, i) =>
      addDays(today, i - (GRID_DAYS - 1))
    )
  }, [today])

  const persistHabits = (next: Habit[]) => {
    setHabits(next)
    saveHabits(next)
  }
  const persistLogs = (next: HabitLogs) => {
    setLogs(next)
    saveHabitLogs(next)
  }

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    persistHabits([
      ...habits,
      { id: uid(), name: name.trim(), category, createdAt: today },
    ])
    setName('')
    setAdding(false)
  }

  const toggle = (habitId: string, day: string) => {
    const h = { ...(logs[habitId] || {}) }
    if (h[day]) delete h[day]
    else h[day] = true
    persistLogs({ ...logs, [habitId]: h })
  }

  const streak = (habitId: string) => {
    const h = logs[habitId] || {}
    let s = 0
    let d = today
    if (!h[d]) d = addDays(d, -1) // today not done yet doesn't break the streak
    while (h[d]) {
      s++
      d = addDays(d, -1)
    }
    return s
  }

  return (
    <AppShell title="Habits" subtitle={`activity rhythm · ${GRID_DAYS} days`}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-ink3">
          Tracking {habits.length}{' '}
          {habits.length === 1 ? 'routine' : 'routines'} — tap today&apos;s cell
          to mark it done.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
        >
          + Add habit
        </button>
      </div>

      {adding && (
        <form
          onSubmit={addHabit}
          className="bg-panel border border-line rounded-xl p-5 shadow-card mb-8 flex flex-wrap items-end gap-4"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="microlabel block mb-2">Habit</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 20 minutes"
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
            />
          </div>
          <div>
            <label className="microlabel block mb-2">Axis</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="px-4 py-2.5 border border-line rounded-lg text-sm text-ink3"
          >
            Cancel
          </button>
        </form>
      )}

      {habits.length === 0 && !adding && (
        <div className="border border-dashed border-linestrong rounded-xl py-16 text-center">
          <p className="text-lg text-ink3 mb-1">Build your rhythm.</p>
          <p className="font-hand text-2xl text-mute">
            schedule a daily activity — streaks land here
          </p>
        </div>
      )}

      <div className="space-y-6">
        {habits.map((h) => {
          const hLogs = logs[h.id] || {}
          const done30 = days.slice(-30).filter((d) => hLogs[d]).length
          return (
            <div
              key={h.id}
              className="bg-panel border border-line rounded-xl p-5 shadow-card"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[h.category]}`}
                />
                <span className="font-medium text-ink">{h.name}</span>
                <span className="microlabel">{CATEGORY_LABEL[h.category]}</span>
                <span className="ml-auto font-mono text-[11px] text-mute">
                  {streak(h.id)}🔥 streak · {done30}/30d
                </span>
                <button
                  onClick={() => {
                    persistHabits(habits.filter((x) => x.id !== h.id))
                    const next = { ...logs }
                    delete next[h.id]
                    persistLogs(next)
                  }}
                  className="text-faint hover:text-ember text-xs transition-colors"
                >
                  remove
                </button>
              </div>

              <div className="flex flex-wrap gap-[3px]">
                {days.map((d) => {
                  const done = !!hLogs[d]
                  const isToday = d === today
                  return (
                    <button
                      key={d}
                      onClick={() => toggle(h.id, d)}
                      title={d}
                      className={`w-3.5 h-5 rounded-[3px] transition-colors ${
                        done
                          ? CATEGORY_DOT[h.category]
                          : 'bg-panel2 hover:bg-line'
                      } ${isToday ? 'ring-1 ring-ember' : ''}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
