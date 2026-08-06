// Lightweight localStorage data layer for the "live" sections (Today, Habits,
// Learning, Stats, Settings). Essays stay on Supabase; everything here is
// per-device, which keeps the static deployment self-contained.

export type Category =
  | 'spiritual'
  | 'physical'
  | 'social'
  | 'financial'
  | 'educational'

export const CATEGORIES: Category[] = [
  'spiritual',
  'physical',
  'social',
  'financial',
  'educational',
]

export type AppSettings = {
  city: string
  method: 'MuslimWorldLeague' | 'ISNA' | 'Egyptian' | 'UmmAlQura' | 'Karachi'
  madhab: 'Hanafi' | 'Shafi'
  displayName: string
}

export type Task = {
  id: string
  date: string // yyyy-mm-dd in the city's timezone
  anchor: string // prayer name the task follows
  title: string
  done: boolean
}

export type Habit = {
  id: string
  name: string
  category: Category
  createdAt: string
}

// habit logs: { [habitId]: { [yyyy-mm-dd]: true } }
export type HabitLogs = Record<string, Record<string, boolean>>

export type Book = {
  id: string
  title: string
  topic: string
  pagesTotal: number
  pagesRead: number
  finishedAt?: string
}

import { supabase } from '@/lib/supabase'

// localStorage is the fast cache; when a user is signed in every write is
// mirrored to the user_data table so laptop and phone see the same data.
const SYNC_KEYS = [
  'alinoor_settings',
  'alinoor_tasks',
  'alinoor_habits',
  'alinoor_habit_logs',
  'alinoor_books',
  'alinoor_arabic_stars',
]

// Which account the cached data in this browser belongs to. Without this a
// second user signing in on the same device would inherit — and silently
// upload into their own account — whatever the previous user left behind.
const OWNER_KEY = 'alinoor_owner'

let cloudUser: string | null = null
let hydratedFor: string | null = null

// Sync failures must be visible: a silent failure looks identical to "you have
// no data", and the next local write would then overwrite the cloud with it.
let syncError = false
const syncListeners = new Set<(failed: boolean) => void>()

const setSyncError = (failed: boolean) => {
  if (failed === syncError) return
  syncError = failed
  syncListeners.forEach((fn) => fn(syncError))
}

export const getSyncError = () => syncError

export const onSyncStatus = (fn: (failed: boolean) => void) => {
  syncListeners.add(fn)
  fn(syncError)
  return () => {
    syncListeners.delete(fn)
  }
}

export const clearLocalData = () => {
  try {
    for (const key of SYNC_KEYS) window.localStorage.removeItem(key)
    window.localStorage.removeItem(OWNER_KEY)
  } catch {}
}

export const setCloudUser = (id: string | null) => {
  cloudUser = id
  if (id === null) hydratedFor = null
}

export const signOutAndClear = async () => {
  setCloudUser(null)
  clearLocalData()
  setSyncError(false)
  // 'local' so signing out of the laptop does not kill the phone's session.
  await supabase.auth.signOut({ scope: 'local' })
}

// Pull the user's data down; cloud wins, but local-only keys (data created
// before the first login on this device) are pushed up instead of lost.
export const cloudHydrate = async (userId: string): Promise<{ ok: boolean }> => {
  cloudUser = userId
  if (hydratedFor === userId) return { ok: true }

  let previousOwner: string | null = null
  try {
    previousOwner = window.localStorage.getItem(OWNER_KEY)
  } catch {}

  // Someone else used this browser: their cache is not ours to read or upload.
  // A null owner means the data was made while signed out, so it is genuinely
  // this user's and still gets pushed up below.
  const inherited = previousOwner === null
  if (previousOwner !== null && previousOwner !== userId) clearLocalData()

  const { data, error } = await supabase
    .from('user_data')
    .select('key, value')
    .eq('user_id', userId)

  // Treat an unreadable cloud as unknown, never as empty — carrying on here
  // would show the account as blank and let the next write erase it.
  if (error) {
    setSyncError(true)
    return { ok: false }
  }

  const cloudKeys = new Set((data || []).map((r) => r.key))
  for (const row of data || []) {
    try {
      window.localStorage.setItem(row.key, JSON.stringify(row.value))
    } catch {}
  }

  if (inherited || previousOwner === userId) {
    for (const key of SYNC_KEYS) {
      if (cloudKeys.has(key)) continue
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const { error: upErr } = await supabase
        .from('user_data')
        .upsert(
          { user_id: userId, key, value: JSON.parse(raw) },
          { onConflict: 'user_id,key' }
        )
      if (upErr) setSyncError(true)
    }
  }

  try {
    window.localStorage.setItem(OWNER_KEY, userId)
  } catch {}
  hydratedFor = userId
  setSyncError(false)
  return { ok: true }
}

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
  if (cloudUser) {
    supabase
      .from('user_data')
      .upsert(
        {
          user_id: cloudUser,
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' }
      )
      .then(
        ({ error }) => setSyncError(!!error),
        () => setSyncError(true)
      )
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  city: 'Tashkent',
  method: 'MuslimWorldLeague',
  madhab: 'Hanafi',
  displayName: '',
}

export const loadSettings = () =>
  read<AppSettings>('alinoor_settings', DEFAULT_SETTINGS)
export const saveSettings = (s: AppSettings) => write('alinoor_settings', s)

export const loadTasks = () => read<Task[]>('alinoor_tasks', [])
export const saveTasks = (t: Task[]) => write('alinoor_tasks', t)

export const loadHabits = () => read<Habit[]>('alinoor_habits', [])
export const saveHabits = (h: Habit[]) => write('alinoor_habits', h)

export const loadHabitLogs = () => read<HabitLogs>('alinoor_habit_logs', {})
export const saveHabitLogs = (l: HabitLogs) => write('alinoor_habit_logs', l)

export const loadBooks = () => read<Book[]>('alinoor_books', [])
export const saveBooks = (b: Book[]) => write('alinoor_books', b)

export const loadStars = () =>
  read<Record<string, boolean>>('alinoor_arabic_stars', {})
export const saveStars = (s: Record<string, boolean>) =>
  write('alinoor_arabic_stars', s)

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

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

export const CATEGORY_LABEL: Record<Category, string> = {
  spiritual: 'Spiritual',
  physical: 'Physical',
  social: 'Social',
  financial: 'Financial',
  educational: 'Educational',
}

// Tailwind classes per category (defined as tokens in globals.css)
export const CATEGORY_DOT: Record<Category, string> = {
  spiritual: 'bg-warn',
  physical: 'bg-good',
  social: 'bg-catsocial',
  financial: 'bg-catfin',
  educational: 'bg-catedu',
}
