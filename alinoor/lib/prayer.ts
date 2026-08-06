import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan'
import { findCity } from '@/lib/cities'
import { dateInTz } from '@/lib/store'
import type { AppSettings } from '@/lib/store'

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

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

const ymdParts = (tz: string, date: Date): [number, number, number] => {
  const [y, m, d] = dateInTz(tz, date).split('-').map(Number)
  return [y, m, d]
}

// adhan reads the calendar date straight off the Date in whatever timezone the
// browser happens to be in, so a traveller in Edmonton looking at Tashkent used
// to get the wrong day's times. Always anchor on the city's own calendar date,
// at local noon — far enough from either midnight that no browser timezone can
// shift which day adhan sees.
const timesForYmd = (
  settings: AppSettings,
  y: number,
  m: number,
  d: number
): TimedPrayer[] => {
  const city = findCity(settings.city)
  const params = methodParams(settings.method)
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi
  const pt = new PrayerTimes(
    new Coordinates(city.lat, city.lng),
    new Date(y, m - 1, d, 12),
    params
  )
  return [
    { name: 'Fajr', time: pt.fajr },
    { name: 'Sunrise', time: pt.sunrise },
    { name: 'Dhuhr', time: pt.dhuhr },
    { name: 'Asr', time: pt.asr },
    { name: 'Maghrib', time: pt.maghrib },
    { name: 'Isha', time: pt.isha },
  ]
}

export const timesFor = (settings: AppSettings, date: Date): TimedPrayer[] => {
  const city = findCity(settings.city)
  const [y, m, d] = ymdParts(city.tz, date)
  return timesForYmd(settings, y, m, d)
}

// The Islamic day runs Maghrib to Maghrib: the sequence starts at the most
// recent Maghrib and ends just before the next one.
export const maghribDay = (settings: AppSettings, now: Date = new Date()) => {
  const city = findCity(settings.city)
  const [y, m, d] = ymdParts(city.tz, now)

  // Calendar arithmetic rather than ±86 400 000 ms: on a DST fall-back day the
  // millisecond step lands back on the same local date, which listed one
  // neighbour's prayers twice and skipped the other's entirely.
  const all = [
    ...timesForYmd(settings, y, m, d - 1),
    ...timesForYmd(settings, y, m, d),
    ...timesForYmd(settings, y, m, d + 1),
  ].sort((a, b) => a.time.getTime() - b.time.getTime())

  const maghribs = all.filter((p) => p.name === 'Maghrib')
  let startIdx = -1
  for (let i = 0; i < maghribs.length; i++) {
    if (maghribs[i].time <= now) startIdx = i
  }
  // The three-day span always brackets `now`; bail rather than silently
  // returning a window that starts in the future.
  if (startIdx < 0 || startIdx + 1 >= maghribs.length) return null

  const start = maghribs[startIdx]
  const end = maghribs[startIdx + 1]

  const sequence = all
    .filter((p) => p.name !== 'Sunrise')
    .filter((p) => p.time >= start.time && p.time < end.time)

  const next =
    all.filter((p) => p.name !== 'Sunrise').find((p) => p.time > now) ||
    sequence[0]

  const current =
    [...sequence].reverse().find((p) => p.time <= now) || sequence[0]

  return { sequence, next, current, start: start.time, end: end.time }
}

// The single source of truth for "which day am I planning?". Tasks, habit logs
// and statistics must all agree, so they all key off the Maghrib-to-Maghrib
// window's closing date rather than the civil date — otherwise anything entered
// between Maghrib and midnight lands on the previous day and appears to vanish.
export const planningDay = (
  settings: AppSettings,
  now: Date = new Date()
): string => {
  const city = findCity(settings.city)
  const day = maghribDay(settings, now)
  return dateInTz(city.tz, day ? day.end : now)
}

export const fmtTime = (d: Date, tz: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)

// Minutes past local midnight in the given IANA timezone (for ring angles).
export const minutesInTz = (d: Date, tz: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  const [h, m] = parts.split(':').map(Number)
  return h * 60 + m
}

export const countdown = (to: Date, now: Date = new Date()) => {
  const ms = Math.max(0, to.getTime() - now.getTime())
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
