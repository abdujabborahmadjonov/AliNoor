import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan'
import { findCity } from './cities'
import type { AppSettings } from './store'

export type PrayerName =
  | 'Fajr'
  | 'Sunrise'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Isha'

export type TimedPrayer = {
  name: PrayerName
  time: Date
}

const methodParams = (method: AppSettings['method']) => {
  switch (method) {
    case 'ISNA':
      return CalculationMethod.NorthAmerica()
    case 'Egyptian':
      return CalculationMethod.Egyptian()
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura()
    case 'Karachi':
      return CalculationMethod.Karachi()
    default:
      return CalculationMethod.MuslimWorldLeague()
  }
}

export const timesFor = (settings: AppSettings, date: Date): TimedPrayer[] => {
  const city = findCity(settings.city)
  const params = methodParams(settings.method)
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi
  const pt = new PrayerTimes(new Coordinates(city.lat, city.lng), date, params)
  return [
    { name: 'Fajr', time: pt.fajr },
    { name: 'Sunrise', time: pt.sunrise },
    { name: 'Dhuhr', time: pt.dhuhr },
    { name: 'Asr', time: pt.asr },
    { name: 'Maghrib', time: pt.maghrib },
    { name: 'Isha', time: pt.isha },
  ]
}

// The Islamic day runs Maghrib to Maghrib.
export const maghribDay = (settings: AppSettings, now: Date = new Date()) => {
  const dayMs = 24 * 60 * 60 * 1000
  const yesterday = timesFor(settings, new Date(now.getTime() - dayMs))
  const today = timesFor(settings, now)
  const tomorrow = timesFor(settings, new Date(now.getTime() + dayMs))

  const all = [...yesterday, ...today, ...tomorrow]
  const maghribs = all.filter(p => p.name === 'Maghrib')
  const start = [...maghribs].reverse().find(m => m.time <= now) || maghribs[0]
  const end = maghribs.find(m => m.time > start.time)!

  const sequence = all
    .filter(p => p.time >= start.time && p.time < end.time)
    .filter(p => p.name !== 'Sunrise')
    .sort((a, b) => a.time.getTime() - b.time.getTime())

  const next =
    all
      .filter(p => p.name !== 'Sunrise')
      .sort((a, b) => a.time.getTime() - b.time.getTime())
      .find(p => p.time > now) || sequence[0]

  const current = [...sequence].reverse().find(p => p.time <= now) || sequence[0]

  return { sequence, next, current }
}

export const fmtTime = (d: Date, tz: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
  } catch {
    const h = `${d.getHours()}`.padStart(2, '0')
    const m = `${d.getMinutes()}`.padStart(2, '0')
    return `${h}:${m}`
  }
}

export const dateInTz = (tz: string, d: Date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

export const countdown = (to: Date, now: Date = new Date()) => {
  const ms = Math.max(0, to.getTime() - now.getTime())
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
