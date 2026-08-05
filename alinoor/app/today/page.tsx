'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import AuthGate from '@/app/components/AuthGate'
import { City, findCity } from '@/lib/cities'
import {
  TimedPrayer,
  countdown,
  fmtTime,
  maghribDay,
  minutesInTz,
  timesFor,
} from '@/lib/prayer'
import {
  AppSettings,
  Task,
  dateInTz,
  loadSettings,
  loadTasks,
  saveTasks,
  uid,
} from '@/lib/store'

const SHORT: Record<string, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunr',
  Dhuhr: 'Dhuh',
  Asr: 'Asr',
  Maghrib: 'Magh',
  Isha: 'Isha',
}

// 24-hour dial: each prayer sits at its time-of-day angle, the night span
// (Maghrib → Fajr) is drawn as a darker arc, and the sun marker shows now.
function PrayerRing({
  times,
  city,
  now,
  next,
}: {
  times: TimedPrayer[]
  city: City
  now: Date
  next: TimedPrayer
}) {
  const C = 120
  const R = 88

  const pos = (mins: number, r: number): [number, number] => {
    const a = (mins / 1440) * 2 * Math.PI - Math.PI / 2
    return [C + Math.cos(a) * r, C + Math.sin(a) * r]
  }

  const minsOf = (p: TimedPrayer) => minutesInTz(p.time, city.tz)
  const nowMin = minutesInTz(now, city.tz)
  const maghrib = times.find((t) => t.name === 'Maghrib')!
  const fajr = times.find((t) => t.name === 'Fajr')!

  const arcPath = (fromMin: number, toMin: number) => {
    const [x1, y1] = pos(fromMin, R)
    const [x2, y2] = pos(toMin, R)
    const delta = ((toMin - fromMin + 1440) % 1440) / 4 // degrees
    const large = delta > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
  }

  const [sx, sy] = pos(nowMin, R)

  return (
    <div className="relative">
      <svg viewBox="0 0 240 240" className="w-full">
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="rgb(var(--an-line))"
          strokeWidth="5"
        />
        {/* night span */}
        <path
          d={arcPath(minsOf(maghrib), minsOf(fajr))}
          fill="none"
          stroke="rgb(var(--an-cat-social))"
          strokeOpacity="0.85"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* prayer markers + labels */}
        {times.map((p) => {
          const m = minsOf(p)
          const [x, y] = pos(m, R)
          const [lx, ly] = pos(m, R + 20)
          return (
            <g key={p.name}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="rgb(var(--an-panel))"
                stroke={
                  p.name === next.name
                    ? 'rgb(var(--an-ember))'
                    : 'rgb(var(--an-lineStrong))'
                }
                strokeWidth="2"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill={
                  p.name === next.name
                    ? 'rgb(var(--an-ember))'
                    : 'rgb(var(--an-mute))'
                }
              >
                {SHORT[p.name]}
              </text>
            </g>
          )
        })}
        {/* sun = now */}
        <circle cx={sx} cy={sy} r="10" fill="rgb(var(--an-warn))" opacity="0.25" />
        <circle cx={sx} cy={sy} r="5.5" fill="rgb(var(--an-warn))" />
      </svg>

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="microlabel">next · {next.name}</p>
        <p className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {countdown(next.time, now)}
        </p>
        <p className="font-mono text-[11px] text-mute mt-1">
          at {fmtTime(next.time, city.tz)}
        </p>
      </div>
    </div>
  )
}

// Simple month calendar (Monday-first) with today highlighted.
function MonthCalendar({ tz }: { tz: string }) {
  const [offset, setOffset] = useState(0)
  const todayYmd = dateInTz(tz)
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
          <span
            key={c.ymd}
            className={`font-mono text-[12px] py-1 mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
              c.ymd === todayYmd
                ? 'bg-ink text-bg font-semibold'
                : c.inMonth
                  ? 'text-ink2'
                  : 'text-faint'
            }`}
          >
            {c.day}
          </span>
        ))}
      </div>
    </div>
  )
}

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

        {/* SIDEBAR — ring, calendar, progress */}
        <div className="space-y-5">
          <div className="bg-panel border border-line rounded-xl p-5 shadow-card">
            <p className="microlabel mb-2">
              now · <span className="text-ink2">{day.current.name}</span>
            </p>
            <PrayerRing
              times={timesFor(settings, now)}
              city={city}
              now={now}
              next={day.next}
            />
          </div>

          <div className="bg-panel border border-line rounded-xl p-5 shadow-card">
            <MonthCalendar tz={city.tz} />
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
