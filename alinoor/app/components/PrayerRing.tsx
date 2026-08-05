'use client'

import { City } from '@/lib/cities'
import { TimedPrayer, countdown, fmtTime, minutesInTz } from '@/lib/prayer'

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
export default function PrayerRing({
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
        <path
          d={arcPath(minsOf(maghrib), minsOf(fajr))}
          fill="none"
          stroke="rgb(var(--an-cat-social))"
          strokeOpacity="0.85"
          strokeWidth="5"
          strokeLinecap="round"
        />
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
        <circle cx={sx} cy={sy} r="10" fill="rgb(var(--an-warn))" opacity="0.25" />
        <circle cx={sx} cy={sy} r="5.5" fill="rgb(var(--an-warn))" />
      </svg>

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
