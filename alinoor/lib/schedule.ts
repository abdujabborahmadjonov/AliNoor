// The daily schedule: tasks hung after each prayer of a Maghrib-to-Maghrib
// day. Pure functions only (no browser, no Supabase), so the in-app AI planner
// and the MCP server edit the schedule through exactly the same rules.

export type Task = {
  id: string
  date: string // yyyy-mm-dd: the planning day (the Maghrib that closes it)
  anchor: string // prayer name the task follows
  title: string
  done: boolean
}

// In day order: the day opens at Maghrib, so Maghrib and Isha come first.
export const ANCHORS = ['Maghrib', 'Isha', 'Fajr', 'Dhuhr', 'Asr'] as const
export type Anchor = (typeof ANCHORS)[number]

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

const YMD = /^\d{4}-\d{2}-\d{2}$/

const isYmd = (v: unknown): v is string =>
  typeof v === 'string' &&
  YMD.test(v) &&
  !Number.isNaN(Date.parse(`${v}T00:00:00Z`))

const isAnchor = (v: unknown): v is Anchor =>
  typeof v === 'string' && (ANCHORS as readonly string[]).includes(v)

const cleanTitle = (v: unknown) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 200) : ''

export const tasksForDay = (tasks: Task[], date: string) =>
  tasks
    .filter((t) => t.date === date)
    .sort(
      (a, b) =>
        ANCHORS.indexOf(a.anchor as Anchor) - ANCHORS.indexOf(b.anchor as Anchor)
    )

// A plain-text view of one day, for the model and for MCP clients.
export const describeDay = (tasks: Task[], date: string) => {
  const day = tasksForDay(tasks, date)
  if (day.length === 0) return `${date}: no tasks yet.`
  const lines = ANCHORS.flatMap((a) => {
    const at = day.filter((t) => t.anchor === a)
    if (at.length === 0) return []
    return [
      `After ${a}:`,
      ...at.map((t) => `  - [${t.done ? 'x' : ' '}] ${t.title} (id: ${t.id})`),
    ]
  })
  return [`${date}:`, ...lines].join('\n')
}

// JSON Schemas for the schedule tools. Inputs are validated again in
// applyScheduleTool, so a malformed call becomes an error result, not bad data.
export const SCHEDULE_TOOLS = [
  {
    name: 'list_tasks',
    description:
      "List the tasks planned for one day, grouped by the prayer they follow, with each task's id. Call this before changing a day you haven't read yet.",
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'The day, as yyyy-mm-dd.' },
      },
      required: ['date'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_task',
    description:
      'Add one task to a day, placed after the given prayer. Keep titles short, like a to-do item ("Read 10 pages of Riyad as-Salihin"); put a duration in the title when one was asked for.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'The day, as yyyy-mm-dd.' },
        anchor: {
          type: 'string',
          enum: [...ANCHORS],
          description: 'The prayer the task comes after.',
        },
        title: { type: 'string', description: 'What to do.' },
      },
      required: ['date', 'anchor', 'title'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_task',
    description:
      'Change an existing task by id: rename it, move it to another prayer or day, or mark it done or not done. Only the fields given change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        anchor: { type: 'string', enum: [...ANCHORS] },
        date: { type: 'string', description: 'Move to this day (yyyy-mm-dd).' },
        done: { type: 'boolean' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_task',
    description: 'Remove a task by id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const

export type ScheduleToolName = (typeof SCHEDULE_TOOLS)[number]['name']

export type ScheduleChange =
  | { kind: 'added'; task: Task }
  | { kind: 'updated'; before: Task; after: Task }
  | { kind: 'deleted'; task: Task }

export type ToolOutcome = {
  tasks: Task[]
  result: string
  isError: boolean
  change?: ScheduleChange
}

const fail = (tasks: Task[], result: string): ToolOutcome => ({
  tasks,
  result,
  isError: true,
})

// Runs one schedule tool against a task list and returns the new list. Never
// mutates its input.
export const applyScheduleTool = (
  tasks: Task[],
  name: string,
  input: Record<string, unknown>
): ToolOutcome => {
  switch (name) {
    case 'list_tasks': {
      if (!isYmd(input.date)) return fail(tasks, 'date must be yyyy-mm-dd')
      return { tasks, result: describeDay(tasks, input.date), isError: false }
    }

    case 'add_task': {
      const title = cleanTitle(input.title)
      if (!isYmd(input.date)) return fail(tasks, 'date must be yyyy-mm-dd')
      if (!isAnchor(input.anchor))
        return fail(tasks, `anchor must be one of ${ANCHORS.join(', ')}`)
      if (!title) return fail(tasks, 'title is empty')
      const task: Task = {
        id: uid(),
        date: input.date,
        anchor: input.anchor,
        title,
        done: false,
      }
      return {
        tasks: [...tasks, task],
        result: `Added "${title}" after ${task.anchor} on ${task.date} (id: ${task.id}).`,
        isError: false,
        change: { kind: 'added', task },
      }
    }

    case 'update_task': {
      const before = tasks.find((t) => t.id === input.id)
      if (!before) return fail(tasks, `no task with id ${String(input.id)}`)
      const after: Task = { ...before }
      if (input.title !== undefined) {
        const title = cleanTitle(input.title)
        if (!title) return fail(tasks, 'title is empty')
        after.title = title
      }
      if (input.anchor !== undefined) {
        if (!isAnchor(input.anchor))
          return fail(tasks, `anchor must be one of ${ANCHORS.join(', ')}`)
        after.anchor = input.anchor
      }
      if (input.date !== undefined) {
        if (!isYmd(input.date)) return fail(tasks, 'date must be yyyy-mm-dd')
        after.date = input.date
      }
      if (input.done !== undefined) {
        if (typeof input.done !== 'boolean')
          return fail(tasks, 'done must be true or false')
        after.done = input.done
      }
      return {
        tasks: tasks.map((t) => (t.id === before.id ? after : t)),
        result: `Updated: "${after.title}" after ${after.anchor} on ${after.date}${after.done ? ', done' : ''}.`,
        isError: false,
        change: { kind: 'updated', before, after },
      }
    }

    case 'delete_task': {
      const task = tasks.find((t) => t.id === input.id)
      if (!task) return fail(tasks, `no task with id ${String(input.id)}`)
      return {
        tasks: tasks.filter((t) => t.id !== task.id),
        result: `Deleted "${task.title}".`,
        isError: false,
        change: { kind: 'deleted', task },
      }
    }

    default:
      return fail(tasks, `unknown tool ${name}`)
  }
}

// Re-applies a run's changes on top of a newer task list, so edits made in
// the app while the planner was working aren't overwritten by its snapshot.
export const replayChanges = (tasks: Task[], changes: ScheduleChange[]) =>
  changes.reduce((acc, c) => {
    if (c.kind === 'added')
      return acc.some((t) => t.id === c.task.id) ? acc : [...acc, c.task]
    if (c.kind === 'updated')
      return acc.map((t) => (t.id === c.after.id ? c.after : t))
    return acc.filter((t) => t.id !== c.task.id)
  }, tasks)

// The changes that undo a run, newest first.
export const invertChanges = (changes: ScheduleChange[]): ScheduleChange[] =>
  [...changes].reverse().map((c) => {
    if (c.kind === 'added') return { kind: 'deleted', task: c.task }
    if (c.kind === 'deleted') return { kind: 'added', task: c.task }
    return { kind: 'updated', before: c.after, after: c.before }
  })
