'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import PrayerRing from '@/app/components/PrayerRing'
import { City, findCity } from '@/lib/cities'
import {
  TimedPrayer,
  countdown,
  fmtTime,
  maghribDay,
  minutesInTz,
  planningDay,
  timesFor,
} from '@/lib/prayer'
import {
  AppSettings,
  Task,
  loadSettings,
  loadTasks,
  saveTasks,
  uid,
} from '@/lib/store'

// Month calendar (Monday-first): today filled, selected ringed, any day
// tappable to plan that day.
function MonthCalendar({
  todayYmd,
  selected,
  onSelect,
}: {
  todayYmd: string
  selected: string
  onSelect: (ymd: string) => void
}) {
  const [offset, setOffset] = useState(0)
  const [ty, tm] = todayYmd.split('-').map(Number)

  const first = new Date(Date.UTC(ty, tm - 1 + offset, 1))
  const y = first.getUTCFullYear()
  const m = first.getUTCMonth()
  const lead = (first.getUTCDay() + 6) % 7 // Monday-first
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(y, m, 1 - lead + i))
    return {
      ymd: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === m,
    }
  })

  const title = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(first)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setOffset(offset - 1)}
          aria-label="previous month"
          className="w-7 h-7 rounded-lg text-ink3 hover:text-ink hover:bg-panel2 transition-colors"
        >
          ‹
        </button>
        <p className="font-semibold text-ink text-sm">{title}</p>
        <button
          onClick={() => setOffset(offset + 1)}
          aria-label="next month"
          className="w-7 h-7 rounded-lg text-ink3 hover:text-ink hover:bg-panel2 transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="font-mono text-[10px] text-faint py-1">
            {d}
          </span>
        ))}
        {cells.map((c) => (
          <button
            key={c.ymd}
            onClick={() => onSelect(c.ymd)}
            className={`font-mono text-[12px] py-1 mx-auto w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
              c.ymd === todayYmd
                ? 'bg-ink text-bg font-semibold'
                : c.ymd === selected
                  ? 'ring-1 ring-ember text-ink font-semibold'
                  : c.inMonth
                    ? 'text-ink2 hover:bg-panel2'
                    : 'text-faint hover:bg-panel2'
            }`}
          >
            {c.day}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PageInner() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(new Date())
  const [addingAfter, setAddingAfter] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [selectedYmd, setSelectedYmd] = useState('')

  useEffect(() => {
    setSettings(loadSettings())
    setTasks(loadTasks())
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Keyed to the Maghrib-to-Maghrib window, not the civil date: a task added
  // after Maghrib belongs to the Islamic day that has already begun, and
  // keying it to the civil date made it vanish at midnight.
  const todayYmd = settings ? planningDay(settings, now) : ''
  const viewYmd = selectedYmd || todayYmd
  const isToday = viewYmd === todayYmd

  // Prayer times for the viewed day: local noon of that date anchors the
  // Maghrib-to-Maghrib window when browsing other days.
  const anchor = useMemo(() => {
    if (isToday || !viewYmd) return now
    const [y, m, d] = viewYmd.split('-').map(Number)
    return new Date(y, m - 1, d, 12, 0, 0)
  }, [isToday, viewYmd, now])

  const day = useMemo(
    () => (settings ? maghribDay(settings, anchor) : null),
    [settings, anchor]
  )

  const ringTimes = useMemo(
    () => (settings ? timesFor(settings, anchor) : null),
    [settings, anchor]
  )

  if (!settings || !day) {
    return (
      <AppShell title="Today">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </AppShell>
    )
  }

  const city = findCity(settings.city)
  const dayTasks = tasks.filter((t) => t.date === viewYmd)

  const persist = (next: Task[]) => {
    setTasks(next)
    saveTasks(next)
  }

  const addTask = (anchor: string) => {
    if (!draft.trim()) return
    persist([
      ...tasks,
      { id: uid(), date: viewYmd, anchor, title: draft.trim(), done: false },
    ])
    setDraft('')
    setAddingAfter(null)
  }

  const [vy, vm, vd] = viewYmd.split('-').map(Number)
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(vy, vm - 1, vd)))

  return (
    <AppShell
      title={isToday ? 'Today' : 'Planning'}
      subtitle={`${dateLabel} · ${city.name}`}
    >
      {!isToday && (
        <div className="mb-6 flex items-center gap-3">
          <p className="font-hand text-2xl text-mute">
            planning another day
          </p>
          <button
            onClick={() => setSelectedYmd('')}
            className="px-3 py-1.5 rounded-lg border border-line font-mono text-[11px] text-ink3 hover:text-ink hover:border-linestrong transition-colors"
          >
            back to today
          </button>
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* TIMELINE */}
        <div className="space-y-1">
          {day.sequence.map((p) => {
            const isNow = isToday && day.current.name === p.name
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

        {/* SIDEBAR — ring, calendar, progress */}
        <div className="space-y-5">
          <div className="bg-panel border border-line rounded-xl p-5 shadow-card">
            <p className="microlabel mb-2">
              {isToday ? (
                <>
                  now · <span className="text-ink2">{day.current.name}</span>
                </>
              ) : (
                'planned day'
              )}
            </p>
            {/* Off today the ring is anchored to the viewed day's noon, so the
                dial and its countdown describe that day rather than right now. */}
            <PrayerRing
              times={ringTimes ?? []}
              city={city}
              now={anchor}
              next={day.next}
            />
          </div>

          <div className="bg-panel border border-line rounded-xl p-5 shadow-card">
            <MonthCalendar
              todayYmd={todayYmd}
              selected={viewYmd}
              onSelect={(ymd) => setSelectedYmd(ymd === todayYmd ? '' : ymd)}
            />
            <p className="font-mono text-[10px] text-faint mt-3">
              tap a date to see its prayer times &amp; plan tasks
            </p>
          </div>

          <div className="bg-panel border border-line rounded-xl p-6 shadow-card">
            <p className="microlabel mb-3">
              {isToday ? "today's progress" : "that day's progress"}
            </p>
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
