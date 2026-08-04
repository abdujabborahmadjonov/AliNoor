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
