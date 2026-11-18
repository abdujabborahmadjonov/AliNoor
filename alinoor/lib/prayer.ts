import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan'
import { findCity, utcOffsetMinutes } from './cities'
import { dateInTz } from './dates'
import { dayStart } from './day-start'
import type { AppSettings } from './store'

export { dayStart }

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

// Every prayer of one planning day. Midnight days hold that date's own
// prayers. Maghrib days hold the evening that opens it (Maghrib, Isha
// of the date before), that date's daytime prayers, and the Maghrib that
// closes it.
export const planningDayTimes = (
  settings: AppSettings,
  ymd: string
): TimedPrayer[] => {
  const [y, m, d] = ymd.split('-').map(Number)
  if (dayStart(settings) === 'midnight') return timesForYmd(settings, y, m, d)
  const eve = timesForYmd(settings, y, m, d - 1).filter(
    (p) => p.name === 'Maghrib' || p.name === 'Isha'
  )
  const day = timesForYmd(settings, y, m, d).filter((p) => p.name !== 'Isha')
  return [...eve, ...day]
}

// "Maghrib (evening before) 17:40, Isha (evening before) 18:53, Fajr 05:20, …"
export const fmtPlanningDayTimes = (settings: AppSettings, ymd: string) => {
  const tz = findCity(settings.city).tz
  const times = planningDayTimes(settings, ymd)
  return times
    .map((p, i) => {
      const note =
        dayStart(settings) === 'midnight'
          ? ''
          : i < 2
            ? ' (evening before)'
            : i === times.length - 1
              ? ' (day ends)'
              : ''
      return `${p.name}${note} ${fmtTime(p.time, tz)}`
    })
    .join(', ')
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

// A calendar day, 00:00 to 23:59 in the city: that date's prayers in order,
// with the current and next prayer reaching across midnight on either side.
export const midnightDay = (settings: AppSettings, now: Date = new Date()) => {
  const city = findCity(settings.city)
  const [y, m, d] = ymdParts(city.tz, now)
  const prayers = (dy: number) =>
    timesForYmd(settings, y, m, d + dy).filter((p) => p.name !== 'Sunrise')
  const sequence = prayers(0)
  const around = [...prayers(-1), ...sequence, ...prayers(1)]

  const next = around.find((p) => p.time > now) || sequence[0]
  // Before Fajr it is still the previous night's Isha.
  const current =
    [...around].reverse().find((p) => p.time <= now) || sequence[0]

  const midnight = (dy: number) => {
    const utcMidnight = Date.UTC(y, m - 1, d + dy)
    const offset = utcOffsetMinutes(city.tz, new Date(utcMidnight)) ?? 0
    return new Date(utcMidnight - offset * 60_000)
  }

  return { sequence, next, current, start: midnight(0), end: midnight(1) }
}

// The planning day around `now`, per the user's chosen day start.
export const prayerDay = (settings: AppSettings, now: Date = new Date()) =>
  dayStart(settings) === 'midnight'
    ? midnightDay(settings, now)
    : maghribDay(settings, now)

// The single source of truth for "which day am I planning?". Tasks, habit logs
// and statistics must all agree. With Maghrib days they key off the window's
// closing date rather than the civil date, so anything entered between Maghrib
// and midnight doesn't land on the previous day and appear to vanish.
export const planningDay = (
  settings: AppSettings,
  now: Date = new Date()
): string => {
  const city = findCity(settings.city)
  if (dayStart(settings) === 'midnight') return dateInTz(city.tz, now)
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
