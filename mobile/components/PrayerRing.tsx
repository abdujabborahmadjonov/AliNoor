import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'
import { City } from '../lib/cities'
import {
  TimedPrayer,
  countdown,
  fmtTime,
  minutesInTz,
} from '../lib/prayer'
import { T } from '../lib/theme'

const SHORT: Record<string, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunr',
  Dhuhr: 'Dhuh',
  Asr: 'Asr',
  Maghrib: 'Magh',
  Isha: 'Isha',
}

// 24-hour dial: each prayer at its time-of-day angle, the Maghrib→Fajr night
// span as a darker arc, a sun marker at now, countdown in the middle.
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
  const maghrib = times.find(t => t.name === 'Maghrib')!
  const fajr = times.find(t => t.name === 'Fajr')!

  const arcPath = (fromMin: number, toMin: number) => {
    const [x1, y1] = pos(fromMin, R)
    const [x2, y2] = pos(toMin, R)
    const delta = ((toMin - fromMin + 1440) % 1440) / 4
    const large = delta > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
  }

  const [sx, sy] = pos(nowMin, R)

  return (
    <View style={s.wrap}>
      <Svg viewBox="0 0 240 240" width="100%" height="100%">
        <Circle cx={C} cy={C} r={R} fill="none" stroke={T.line} strokeWidth={5} />
        <Path
          d={arcPath(minsOf(maghrib), minsOf(fajr))}
          fill="none"
          stroke={T.catSocial}
          strokeOpacity={0.85}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {times.map(p => {
          const m = minsOf(p)
          const [x, y] = pos(m, R)
          const [lx, ly] = pos(m, R + 20)
          const isNext = p.name === next.name
          return (
            <G key={p.name}>
              <Circle
                cx={x}
                cy={y}
                r={4}
                fill={T.panel}
                stroke={isNext ? T.ember : T.lineStrong}
                strokeWidth={2}
              />
              <SvgText
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fontSize={9}
                fill={isNext ? T.ember : T.mute}>
                {SHORT[p.name]}
              </SvgText>
            </G>
          )
        })}
        <Circle cx={sx} cy={sy} r={10} fill={T.warn} opacity={0.25} />
        <Circle cx={sx} cy={sy} r={5.5} fill={T.warn} />
      </Svg>

      <View style={s.center} pointerEvents="none">
        <Text style={s.micro}>NEXT · {next.name.toUpperCase()}</Text>
        <Text style={s.big}>{countdown(next.time, now)}</Text>
        <Text style={s.at}>at {fmtTime(next.time, city.tz)}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { aspectRatio: 1, width: '100%' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micro: { fontSize: 10, letterSpacing: 1.6, color: T.mute },
  big: {
    fontSize: 30,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  at: { fontSize: 11, color: T.mute, marginTop: 2 },
})
