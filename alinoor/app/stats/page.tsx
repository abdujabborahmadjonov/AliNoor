'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import AuthGate from '@/app/components/AuthGate'
import { findCity } from '@/lib/cities'
import {
  CATEGORIES,
  CATEGORY_DOT,
  CATEGORY_LABEL,
  Habit,
  HabitLogs,
  Task,
  addDays,
  dateInTz,
  loadHabitLogs,
  loadHabits,
  loadSettings,
  loadTasks,
} from '@/lib/store'

const WINDOW = 30

function PageInner() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLogs>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [today, setToday] = useState('')

  useEffect(() => {
    setHabits(loadHabits())
    setLogs(loadHabitLogs())
    setTasks(loadTasks())
    setToday(dateInTz(findCity(loadSettings().city).tz))
  }, [])

  const days = useMemo(() => {
    if (!today) return []
    return Array.from({ length: WINDOW }, (_, i) =>
      addDays(today, i - (WINDOW - 1))
    )
  }, [today])

  const stats = useMemo(() => {
    if (!today) {
      const perCategory: Record<string, number> = {}
      CATEGORIES.forEach((c) => (perCategory[c] = 0))
      return {
        completions: 0,
        tasksDone: 0,
        perCategory,
        activeDays: new Set<string>(),
        streak: 0,
        max: 1,
      }
    }
    const daySet = new Set(days)
    let completions = 0
    const perCategory: Record<string, number> = {}
    CATEGORIES.forEach((c) => (perCategory[c] = 0))
    const activeDays = new Set<string>()

    for (const h of habits) {
      const hl = logs[h.id] || {}
      for (const d of Object.keys(hl)) {
        if (daySet.has(d)) {
          completions++
          perCategory[h.category]++
          activeDays.add(d)
        }
      }
    }

    const tasksDone = tasks.filter(
      (t) => t.done && daySet.has(t.date)
    ).length
    tasks.forEach((t) => {
      if (t.done && daySet.has(t.date)) activeDays.add(t.date)
    })

    let streak = 0
    let d = today
    if (!activeDays.has(d)) d = addDays(d, -1)
    while (activeDays.has(d)) {
      streak++
      d = addDays(d, -1)
    }

    const max = Math.max(1, ...CATEGORIES.map((c) => perCategory[c]))
    return { completions, tasksDone, perCategory, activeDays, streak, max }
  }, [habits, logs, tasks, days, today])

  // Simple SVG radar over the 5 axes
  const radar = useMemo(() => {
    const cx = 110
    const cy = 110
    const r = 85
    const angle = (i: number) => (Math.PI * 2 * i) / 5 - Math.PI / 2
    const point = (i: number, scale: number) => [
      cx + Math.cos(angle(i)) * r * scale,
      cy + Math.sin(angle(i)) * r * scale,
    ]
    const value = (i: number) =>
      stats.perCategory[CATEGORIES[i]] / stats.max
    const shape = CATEGORIES.map((_, i) =>
      point(i, Math.max(0.06, value(i))).join(',')
    ).join(' ')
    const ring = (scale: number) =>
      CATEGORIES.map((_, i) => point(i, scale).join(',')).join(' ')
    const labels = CATEGORIES.map((c, i) => {
      const [x, y] = point(i, 1.18)
      return { c, x, y }
    })
    return { shape, ring, labels, point }
  }, [stats])

  const per7: number[] = useMemo(() => {
    // completions per day for the last 14 days (habit logs + done tasks)
    return days.slice(-14).map((d) => {
      let n = 0
      for (const h of habits) if ((logs[h.id] || {})[d]) n++
      n += tasks.filter((t) => t.done && t.date === d).length
      return n
    })
  }, [days, habits, logs, tasks])

  const maxBar = Math.max(1, ...per7)

  return (
    <AppShell title="Statistics" subtitle={`balance + trends · last ${WINDOW} days`}>
      {/* Top tiles */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'completions', value: stats.completions, sub: `habits · ${WINDOW}d` },
          { label: 'tasks done', value: stats.tasksDone, sub: `today view · ${WINDOW}d` },
          { label: 'active streak', value: stats.streak, sub: 'consecutive days' },
        ].map((t) => (
          <div key={t.label} className="bg-panel border border-line rounded-xl p-5 shadow-card">
            <p className="microlabel mb-2">{t.label}</p>
            <p className="text-3xl font-semibold text-ink">{t.value}</p>
            <p className="font-mono text-[11px] text-mute mt-1">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* 5-axis balance */}
      <div className="bg-panel border border-line rounded-xl p-6 shadow-card mb-8">
        <p className="font-semibold text-ink mb-1">
          5-axis balance{' '}
          <span className="font-mono text-[12px] text-mute font-normal">
            habit completions by axis
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-10 mt-4">
          <svg viewBox="0 0 220 220" className="w-56 h-56 flex-shrink-0">
            {[0.33, 0.66, 1].map((s) => (
              <polygon
                key={s}
                points={radar.ring(s)}
                fill="none"
                stroke="rgb(var(--an-line))"
                strokeWidth="1"
              />
            ))}
            {CATEGORIES.map((_, i) => {
              const [x, y] = radar.point(i, 1)
              return (
                <line
                  key={i}
                  x1="110"
                  y1="110"
                  x2={x}
                  y2={y}
                  stroke="rgb(var(--an-line))"
                  strokeWidth="1"
                />
              )
            })}
            <polygon
              points={radar.shape}
              fill="rgb(var(--an-ember) / 0.15)"
              stroke="rgb(var(--an-ember))"
              strokeWidth="1.5"
            />
            {radar.labels.map(({ c, x, y }) => (
              <text
                key={c}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-ink3"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {CATEGORY_LABEL[c]}
              </text>
            ))}
          </svg>

          <div className="flex-1 min-w-[220px] space-y-2.5">
            {CATEGORIES.map((c) => {
              const v = stats.perCategory[c]
              return (
                <div key={c} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[c]}`} />
                  <span className="text-sm text-ink2 w-24">
                    {CATEGORY_LABEL[c]}
                  </span>
                  <div className="flex-1 h-1.5 bg-panel2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_DOT[c]}`}
                      style={{ width: `${(v / stats.max) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-mute w-6 text-right">
                    {v}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 14-day trend */}
      <div className="bg-panel border border-line rounded-xl p-6 shadow-card">
        <p className="font-semibold text-ink mb-4">
          Daily activity{' '}
          <span className="font-mono text-[12px] text-mute font-normal">
            last 14 days
          </span>
        </p>
        <div className="flex items-end gap-1.5 h-24">
          {per7.map((n, i) => (
            <div
              key={i}
              title={`${n} completions`}
              className={`flex-1 rounded-t-md transition-all ${
                n > 0 ? 'bg-ember/70' : 'bg-panel2'
              }`}
              style={{ height: `${Math.max(6, (n / maxBar) * 100)}%` }}
            />
          ))}
        </div>
        <p className="font-hand text-xl text-mute mt-4">
          small deeds, done daily
        </p>
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
