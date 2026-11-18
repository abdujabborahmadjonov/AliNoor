// AliNoor MCP server: lets an MCP client (Claude Desktop, Claude Code, …) read
// and edit your AliNoor daily schedule. It signs in to Supabase as you and
// reads/writes the same synced task list the website and phone app use.
//
// Run from the alinoor/ directory:
//   ALINOOR_EMAIL=you@example.com ALINOOR_PASSWORD=… npm run mcp
// See mcp/README.md for client setup.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { findCity } from '../lib/cities'
import { addDays } from '../lib/dates'
import { fmtPlanningDayTimes, planningDay } from '../lib/prayer'
import {
  ANCHORS,
  SCHEDULE_TOOLS,
  Task,
  applyScheduleTool,
  describeDay,
} from '../lib/schedule'
import type { AppSettings } from '../lib/store'

// The project's public client settings (the same ones the website ships with).
// Row-level security means this key can only touch the signed-in user's rows.
const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://cgtetucceocbldqthgiw.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndGV0dWNjZW9jYmxkcXRoZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njc1NzYsImV4cCI6MjA4NTE0MzU3Nn0.NGJ4sSE3kA1KPzTnUokEObM7EB-_okf3O_KRd7KFJ1s'

const DEFAULT_SETTINGS: AppSettings = {
  city: 'Tashkent',
  method: 'MuslimWorldLeague',
  madhab: 'Hanafi',
  displayName: '',
  adhanEnabled: false,
  adhanVoice: 'a1',
  adhanPrayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: true },
})

let userId: string | null = null

const signIn = async () => {
  if (userId) return userId
  const email = process.env.ALINOOR_EMAIL
  const password = process.env.ALINOOR_PASSWORD
  if (!email || !password)
    throw new Error(
      'Set ALINOOR_EMAIL and ALINOOR_PASSWORD for the AliNoor MCP server.'
    )
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.user)
    throw new Error(`Sign-in to AliNoor failed: ${error?.message ?? 'no user'}`)
  userId = data.user.id
  return userId
}

const readKey = async <T>(key: string, fallback: T): Promise<T> => {
  const uid = await signIn()
  const { data, error } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', uid)
    .eq('key', key)
    .maybeSingle()
  // An unreadable row is not an empty one: writing on top of it would wipe it.
  if (error) throw new Error(`Couldn't read ${key}: ${error.message}`)
  return data ? (data.value as T) : fallback
}

const writeKey = async (key: string, value: unknown) => {
  const uid = await signIn()
  // A fresh updated_at makes the website and phone take this copy over their
  // cached one the next time they load.
  const { error } = await supabase.from('user_data').upsert(
    { user_id: uid, key, value, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,key' }
  )
  if (error) throw new Error(`Couldn't save ${key}: ${error.message}`)
}

const loadSettings = async (): Promise<AppSettings> => {
  const stored = await readKey<Partial<AppSettings>>('alinoor_settings', {})
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    adhanPrayers: { ...DEFAULT_SETTINGS.adhanPrayers, ...(stored.adhanPrayers || {}) },
  }
}

const loadTasks = () => readKey<Task[]>('alinoor_tasks', [])

const text = (t: string, isError = false) => ({
  content: [{ type: 'text' as const, text: t }],
  isError,
})

// Errors go back to the client as tool errors, not crashes of the server.
const guard =
  <A>(fn: (args: A) => Promise<string>) =>
  async (args: A) => {
    try {
      return text(await fn(args))
    } catch (err) {
      return text(err instanceof Error ? err.message : String(err), true)
    }
  }

const dateArg = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .describe('The planning day as yyyy-mm-dd. Defaults to today.')

const resolveDate = async (date?: string) =>
  date ?? planningDay(await loadSettings())

const server = new McpServer({ name: 'alinoor', version: '1.0.0' })

server.registerTool(
  'get_today',
  {
    title: 'Today in AliNoor',
    description:
      "Today's planning day in AliNoor (days run Maghrib to Maghrib and are named by the date they end on), the user's city, prayer times and planned tasks.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  guard(async () => {
    const settings = await loadSettings()
    const city = findCity(settings.city)
    const date = planningDay(settings)
    const times = fmtPlanningDayTimes(settings, date)
    return [
      `Planning day: ${date} (tomorrow: ${addDays(date, 1)})`,
      `City: ${city.name}, ${city.country} (${city.tz})`,
      `Prayer times: ${times}`,
      '',
      describeDay(await loadTasks(), date),
    ].join('\n')
  })
)

server.registerTool(
  'get_prayer_times',
  {
    title: 'Prayer times',
    description:
      "Prayer times for a planning day in the user's city and local time. The day opens with the Maghrib and Isha of the evening before.",
    inputSchema: { date: dateArg },
    annotations: { readOnlyHint: true },
  },
  guard(async ({ date }: { date?: string }) => {
    const settings = await loadSettings()
    const day = date ?? planningDay(settings)
    return `${day}: ${fmtPlanningDayTimes(settings, day)}`
  })
)

// The schedule tools share their rules with the in-app AI planner.
const describe = (name: string) =>
  SCHEDULE_TOOLS.find((t) => t.name === name)!.description

// Each edit reads the latest list, changes it and writes it back, so edits
// made in the app between calls are kept.
const edit = async (name: string, input: Record<string, unknown>) => {
  const out = applyScheduleTool(await loadTasks(), name, input)
  if (out.isError) throw new Error(out.result)
  if (out.change) await writeKey('alinoor_tasks', out.tasks)
  return out.result
}

server.registerTool(
  'list_tasks',
  {
    title: 'List tasks',
    description: describe('list_tasks'),
    inputSchema: { date: dateArg },
    annotations: { readOnlyHint: true },
  },
  guard(async ({ date }: { date?: string }) =>
    describeDay(await loadTasks(), await resolveDate(date))
  )
)

server.registerTool(
  'add_task',
  {
    title: 'Add task',
    description: describe('add_task'),
    inputSchema: {
      date: dateArg,
      anchor: z.enum(ANCHORS).describe('The prayer the task comes after.'),
      title: z.string().min(1).describe('What to do.'),
    },
  },
  guard(async ({ date, anchor, title }: { date?: string; anchor: string; title: string }) =>
    edit('add_task', { date: await resolveDate(date), anchor, title })
  )
)

server.registerTool(
  'update_task',
  {
    title: 'Update task',
    description: describe('update_task'),
    inputSchema: {
      id: z.string(),
      title: z.string().min(1).optional(),
      anchor: z.enum(ANCHORS).optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Move to this day (yyyy-mm-dd).'),
      done: z.boolean().optional(),
    },
  },
  guard(async (args: Record<string, unknown>) => edit('update_task', args))
)

server.registerTool(
  'delete_task',
  {
    title: 'Delete task',
    description: describe('delete_task'),
    inputSchema: { id: z.string() },
    annotations: { destructiveHint: true },
  },
  guard(async ({ id }: { id: string }) => edit('delete_task', { id }))
)

server.connect(new StdioServerTransport()).catch((err) => {
  console.error(err)
  process.exit(1)
})
