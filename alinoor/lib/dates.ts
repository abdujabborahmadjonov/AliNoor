// Calendar helpers with no browser or Supabase dependency, so the MCP server
// can share them with the web app.

// yyyy-mm-dd for "now" in a specific IANA timezone
export const dateInTz = (tz: string, d: Date = new Date()) => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(d)
}

export const addDays = (ymd: string, days: number) => {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}
