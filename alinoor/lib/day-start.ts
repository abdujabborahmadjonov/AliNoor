// Where a planning day begins: calendar midnight, or the Islamic day's
// Maghrib. Older saved settings have no value; they get the calendar day,
// which is what most people expect. Kept apart from prayer.ts so pages can
// read it without loading the prayer-time library.
export type DayStart = 'midnight' | 'maghrib'

export const dayStart = (settings: { dayStart?: DayStart }): DayStart =>
  settings.dayStart === 'maghrib' ? 'maghrib' : 'midnight'

// Prayers in the order a planning day meets them.
export const anchorOrder = (settings: { dayStart?: DayStart }) =>
  dayStart(settings) === 'maghrib'
    ? (['Maghrib', 'Isha', 'Fajr', 'Dhuhr', 'Asr'] as const)
    : (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const)

// One sentence on how the user's days run, for the AI planner and MCP tools.
export const dayRule = (settings: { dayStart?: DayStart }) =>
  dayStart(settings) === 'maghrib'
    ? `The user's day runs from Maghrib to Maghrib, as the Islamic day does, and is named by the date it ends on: the tasks "after Maghrib" and "after Isha" for 2026-03-10 happen on the evening of 2026-03-09.`
    : `The user's day is the calendar day, 00:00 to 23:59: the tasks "after Maghrib" and "after Isha" for 2026-03-10 happen on the evening of 2026-03-10.`
