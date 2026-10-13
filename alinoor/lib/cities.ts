export type City = {
  name: string
  country: string
  lat: number
  lng: number
  tz: string
  // Other spellings people search by (Mecca, Bombay, Toshkent…).
  aliases?: string[]
}

// The name is the id saved in settings, so it must stay unique and unchanged.
export const CITIES: City[] = [
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.31, lng: 69.28, tz: 'Asia/Tashkent', aliases: ['Toshkent'] },
  { name: 'Samarkand', country: 'Uzbekistan', lat: 39.65, lng: 66.96, tz: 'Asia/Samarkand', aliases: ['Samarqand'] },
  { name: 'Bukhara', country: 'Uzbekistan', lat: 39.77, lng: 64.42, tz: 'Asia/Samarkand', aliases: ['Buxoro'] },
  { name: 'Namangan', country: 'Uzbekistan', lat: 41.0, lng: 71.67, tz: 'Asia/Tashkent' },
  { name: 'Andijan', country: 'Uzbekistan', lat: 40.78, lng: 72.34, tz: 'Asia/Tashkent', aliases: ['Andijon'] },
  { name: 'Fergana', country: 'Uzbekistan', lat: 40.39, lng: 71.78, tz: 'Asia/Tashkent', aliases: ["Farg'ona", 'Ferghana'] },
  { name: 'Nukus', country: 'Uzbekistan', lat: 42.46, lng: 59.6, tz: 'Asia/Samarkand' },
  { name: 'Edmonton', country: 'Canada', lat: 53.55, lng: -113.49, tz: 'America/Edmonton' },
  { name: 'Calgary', country: 'Canada', lat: 51.05, lng: -114.07, tz: 'America/Edmonton' },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38, tz: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12, tz: 'America/Vancouver' },
  { name: 'Montreal', country: 'Canada', lat: 45.5, lng: -73.57, tz: 'America/Toronto' },
  { name: 'Ottawa', country: 'Canada', lat: 45.42, lng: -75.7, tz: 'America/Toronto' },
  { name: 'Winnipeg', country: 'Canada', lat: 49.9, lng: -97.14, tz: 'America/Winnipeg' },
  { name: 'Halifax', country: 'Canada', lat: 44.65, lng: -63.57, tz: 'America/Halifax' },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.42, lng: 39.83, tz: 'Asia/Riyadh', aliases: ['Mecca'] },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.47, lng: 39.61, tz: 'Asia/Riyadh', aliases: ['Medina'] },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lng: 46.68, tz: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.49, lng: 39.19, tz: 'Asia/Riyadh', aliases: ['Jiddah'] },
  { name: 'Istanbul', country: 'Türkiye', lat: 41.01, lng: 28.98, tz: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Türkiye', lat: 39.93, lng: 32.86, tz: 'Europe/Istanbul' },
  { name: 'Dubai', country: 'UAE', lat: 25.2, lng: 55.27, tz: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'UAE', lat: 24.45, lng: 54.38, tz: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', lat: 25.29, lng: 51.53, tz: 'Asia/Qatar' },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.38, lng: 47.98, tz: 'Asia/Kuwait' },
  { name: 'Manama', country: 'Bahrain', lat: 26.23, lng: 50.59, tz: 'Asia/Bahrain' },
  { name: 'Muscat', country: 'Oman', lat: 23.59, lng: 58.41, tz: 'Asia/Muscat' },
  { name: 'Amman', country: 'Jordan', lat: 31.95, lng: 35.93, tz: 'Asia/Amman' },
  { name: 'Beirut', country: 'Lebanon', lat: 33.89, lng: 35.5, tz: 'Asia/Beirut' },
  { name: 'Damascus', country: 'Syria', lat: 33.51, lng: 36.28, tz: 'Asia/Damascus' },
  { name: 'Baghdad', country: 'Iraq', lat: 33.31, lng: 44.37, tz: 'Asia/Baghdad' },
  { name: 'Tehran', country: 'Iran', lat: 35.69, lng: 51.39, tz: 'Asia/Tehran' },
  { name: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24, tz: 'Africa/Cairo' },
  { name: 'Casablanca', country: 'Morocco', lat: 33.57, lng: -7.59, tz: 'Africa/Casablanca' },
  { name: 'Algiers', country: 'Algeria', lat: 36.75, lng: 3.06, tz: 'Africa/Algiers' },
  { name: 'Tunis', country: 'Tunisia', lat: 36.81, lng: 10.18, tz: 'Africa/Tunis' },
  { name: 'Khartoum', country: 'Sudan', lat: 15.5, lng: 32.56, tz: 'Africa/Khartoum' },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.03, lng: 38.74, tz: 'Africa/Addis_Ababa' },
  { name: 'Mogadishu', country: 'Somalia', lat: 2.05, lng: 45.32, tz: 'Africa/Mogadishu' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.29, lng: 36.82, tz: 'Africa/Nairobi' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.52, lng: 3.38, tz: 'Africa/Lagos' },
  { name: 'Dakar', country: 'Senegal', lat: 14.72, lng: -17.47, tz: 'Africa/Dakar' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2, lng: 28.05, tz: 'Africa/Johannesburg' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.92, lng: 18.42, tz: 'Africa/Johannesburg' },
  { name: 'London', country: 'UK', lat: 51.51, lng: -0.13, tz: 'Europe/London' },
  { name: 'Birmingham', country: 'UK', lat: 52.49, lng: -1.89, tz: 'Europe/London' },
  { name: 'Paris', country: 'France', lat: 48.86, lng: 2.35, tz: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.4, tz: 'Europe/Berlin' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.9, tz: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', lat: 50.85, lng: 4.35, tz: 'Europe/Brussels' },
  { name: 'Madrid', country: 'Spain', lat: 40.42, lng: -3.7, tz: 'Europe/Madrid' },
  { name: 'Rome', country: 'Italy', lat: 41.9, lng: 12.5, tz: 'Europe/Rome' },
  { name: 'Vienna', country: 'Austria', lat: 48.21, lng: 16.37, tz: 'Europe/Vienna' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07, tz: 'Europe/Stockholm' },
  { name: 'Sarajevo', country: 'Bosnia and Herzegovina', lat: 43.86, lng: 18.41, tz: 'Europe/Sarajevo' },
  { name: 'Moscow', country: 'Russia', lat: 55.76, lng: 37.62, tz: 'Europe/Moscow' },
  { name: 'Kazan', country: 'Russia', lat: 55.79, lng: 49.12, tz: 'Europe/Moscow' },
  { name: 'New York', country: 'USA', lat: 40.71, lng: -74.01, tz: 'America/New_York', aliases: ['NYC'] },
  { name: 'Washington DC', country: 'USA', lat: 38.91, lng: -77.04, tz: 'America/New_York' },
  { name: 'Detroit', country: 'USA', lat: 42.33, lng: -83.05, tz: 'America/Detroit' },
  { name: 'Chicago', country: 'USA', lat: 41.88, lng: -87.63, tz: 'America/Chicago' },
  { name: 'Houston', country: 'USA', lat: 29.76, lng: -95.37, tz: 'America/Chicago' },
  { name: 'Dallas', country: 'USA', lat: 32.78, lng: -96.8, tz: 'America/Chicago' },
  { name: 'Denver', country: 'USA', lat: 39.74, lng: -104.99, tz: 'America/Denver' },
  { name: 'Phoenix', country: 'USA', lat: 33.45, lng: -112.07, tz: 'America/Phoenix' },
  { name: 'Los Angeles', country: 'USA', lat: 34.05, lng: -118.24, tz: 'America/Los_Angeles', aliases: ['LA'] },
  { name: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.42, tz: 'America/Los_Angeles' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.13, tz: 'America/Mexico_City' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63, tz: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6, lng: -58.38, tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.14, lng: 101.69, tz: 'Asia/Kuala_Lumpur', aliases: ['KL'] },
  { name: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82, tz: 'Asia/Singapore' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.21, lng: 106.85, tz: 'Asia/Jakarta' },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.25, lng: 112.75, tz: 'Asia/Jakarta' },
  { name: 'Makassar', country: 'Indonesia', lat: -5.15, lng: 119.43, tz: 'Asia/Makassar' },
  { name: 'Bandar Seri Begawan', country: 'Brunei', lat: 4.89, lng: 114.94, tz: 'Asia/Brunei' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lng: 100.5, tz: 'Asia/Bangkok' },
  { name: 'Manila', country: 'Philippines', lat: 14.6, lng: 120.98, tz: 'Asia/Manila' },
  { name: 'Hong Kong', country: 'Hong Kong SAR', lat: 22.32, lng: 114.17, tz: 'Asia/Hong_Kong', aliases: ['HK'] },
  { name: 'Macau', country: 'Macau SAR', lat: 22.2, lng: 113.54, tz: 'Asia/Macau', aliases: ['Macao'] },
  { name: 'Guangzhou', country: 'China', lat: 23.13, lng: 113.26, tz: 'Asia/Shanghai', aliases: ['Canton'] },
  { name: 'Shanghai', country: 'China', lat: 31.23, lng: 121.47, tz: 'Asia/Shanghai' },
  { name: 'Beijing', country: 'China', lat: 39.9, lng: 116.41, tz: 'Asia/Shanghai', aliases: ['Peking'] },
  { name: 'Taipei', country: 'Taiwan', lat: 25.03, lng: 121.57, tz: 'Asia/Taipei' },
  { name: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98, tz: 'Asia/Seoul' },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69, tz: 'Asia/Tokyo' },
  { name: 'Perth', country: 'Australia', lat: -31.95, lng: 115.86, tz: 'Australia/Perth' },
  { name: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96, tz: 'Australia/Melbourne' },
  { name: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21, tz: 'Australia/Sydney' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.85, lng: 174.76, tz: 'Pacific/Auckland' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.86, lng: 67.01, tz: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', lat: 31.55, lng: 74.34, tz: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.68, lng: 73.05, tz: 'Asia/Karachi' },
  { name: 'Kabul', country: 'Afghanistan', lat: 34.53, lng: 69.17, tz: 'Asia/Kabul' },
  { name: 'Delhi', country: 'India', lat: 28.61, lng: 77.21, tz: 'Asia/Kolkata', aliases: ['New Delhi'] },
  { name: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88, tz: 'Asia/Kolkata', aliases: ['Bombay'] },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.81, lng: 90.41, tz: 'Asia/Dhaka' },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.72, lng: 85.32, tz: 'Asia/Kathmandu' },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.93, lng: 79.86, tz: 'Asia/Colombo' },
  { name: 'Malé', country: 'Maldives', lat: 4.18, lng: 73.51, tz: 'Indian/Maldives' },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.24, lng: 76.89, tz: 'Asia/Almaty' },
  { name: 'Astana', country: 'Kazakhstan', lat: 51.17, lng: 71.45, tz: 'Asia/Almaty', aliases: ['Nur-Sultan'] },
  { name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.87, lng: 74.59, tz: 'Asia/Bishkek' },
  { name: 'Dushanbe', country: 'Tajikistan', lat: 38.56, lng: 68.79, tz: 'Asia/Dushanbe' },
  { name: 'Ashgabat', country: 'Turkmenistan', lat: 37.95, lng: 58.38, tz: 'Asia/Ashgabat' },
  { name: 'Baku', country: 'Azerbaijan', lat: 40.41, lng: 49.87, tz: 'Asia/Baku' },
]

export const findCity = (name: string) =>
  CITIES.find((c) => c.name === name) || CITIES[0]

// Country names people type that differ from the label shown.
const COUNTRY_ALIASES: Record<string, string[]> = {
  UAE: ['United Arab Emirates', 'Emirates'],
  UK: ['United Kingdom', 'England', 'Britain'],
  USA: ['United States', 'America'],
  Türkiye: ['Turkey'],
  'Hong Kong SAR': ['China'],
  'Macau SAR': ['China'],
}

const fmtCache = new Map<string, Intl.DateTimeFormat>()

// Minutes the zone is ahead of UTC at the given moment, DST included. Null
// when the runtime has no data for the zone.
export const utcOffsetMinutes = (tz: string, d: Date = new Date()) => {
  try {
    let fmt = fmtCache.get(tz)
    if (!fmt) {
      fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      })
      fmtCache.set(tz, fmt)
    }
    const p: Record<string, number> = {}
    for (const part of fmt.formatToParts(d)) p[part.type] = Number(part.value)
    // Some engines render midnight as hour 24.
    const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute)
    const mins = Math.round((wall - Math.floor(d.getTime() / 60000) * 60000) / 60000)
    return Number.isFinite(mins) ? mins : null
  } catch {
    return null
  }
}

// "UTC+8", "UTC+5:30", "UTC-7"; empty when the offset is unknown.
export const utcOffsetLabel = (tz: string, d: Date = new Date()) => {
  const mins = utcOffsetMinutes(tz, d)
  if (mins === null) return ''
  const abs = Math.abs(mins)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `UTC${mins < 0 ? '-' : '+'}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
}

// Lowercase without accents or apostrophes, with _ and / as spaces, so
// "sao paulo" finds São Paulo and "hong kong" finds Asia/Hong_Kong.
const norm = (s: string) => {
  let out = s
  try {
    out = out.normalize('NFD').replace(/[̀-ͯ]/g, '')
  } catch {
    // no normalize() on this runtime; accents just have to match exactly
  }
  return out
    .toLowerCase()
    .replace(/['’ʻ`]/g, '')
    .replace(/[_/,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const NAMES = new Map(
  CITIES.map((c) => [c.name, [c.name, ...(c.aliases || [])].map(norm)])
)

const HAYSTACKS = new Map(
  CITIES.map((c) => [
    c.name,
    [
      ...NAMES.get(c.name)!,
      norm(c.country),
      ...(COUNTRY_ALIASES[c.country] || []).map(norm),
      norm(c.tz),
    ].join(' | '),
  ])
)

const OFFSET = /^(utc)?[+-]\d{1,2}(:\d{2})?$/

// "+5" means the whole hour, so it finds UTC+5 and UTC+5:30 but not UTC+10.
const offsetMatches = (label: string, word: string) => {
  const want = word.startsWith('utc') ? word : `utc${word}`
  return label === want || label.startsWith(`${want}:`)
}

// Cities matching every word of the query against name, other spellings,
// country, IANA zone or UTC offset ("hong kong", "china", "utc+8", "gmt+5:30").
// Name matches come first; an empty query returns the full list.
export const searchCities = (query: string, now: Date = new Date()) => {
  const q = norm(query).replace(/\bgmt\b/g, 'utc')
  if (!q) return CITIES
  const words = q.split(' ')
  const rank = (c: City) => {
    const names = NAMES.get(c.name)!
    if (names[0] === q) return 0
    if (names.some((n) => n.startsWith(q))) return 1
    if (names.some((n) => n.split(' ').some((w) => w.startsWith(q)))) return 2
    return 3
  }
  return CITIES.map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      const label = utcOffsetLabel(c.tz, now).toLowerCase()
      const hay = `${HAYSTACKS.get(c.name)} | ${label}`
      return words.every((w) =>
        OFFSET.test(w) ? offsetMatches(label, w) : hay.includes(w)
      )
    })
    .map(({ c, i }) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(({ c }) => c)
}
