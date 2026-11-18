// AI planner: turns a plain-language request ("plan a study day with 2 hours
// of Quran after Fajr") into edits to the schedule, using Claude with the
// schedule tools. Runs entirely in the browser with the user's own API key —
// the site is a static export with no server to hold a key.

import Anthropic from '@anthropic-ai/sdk'
import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema'
import { ToolError } from '@anthropic-ai/sdk/lib/tools/ToolError'
import type { AiModel } from '@/lib/ai-models'
import { findCity } from '@/lib/cities'
import { fmtPlanningDayTimes } from '@/lib/prayer'
import {
  SCHEDULE_TOOLS,
  ScheduleChange,
  Task,
  applyScheduleTool,
  describeDay,
} from '@/lib/schedule'
import type { AppSettings } from '@/lib/store'


const SYSTEM = `You are the planner inside AliNoor, a Muslim daily-planning app. The user's day runs from Maghrib to Maghrib and is divided by the five prayers; every task sits after one of them (Maghrib, Isha, Fajr, Dhuhr, Asr). A day is named by the date it ends on: the tasks "after Maghrib" and "after Isha" for 2026-03-10 happen on the evening of 2026-03-09.

Use the tools to read and change the schedule. To build or rework a day, read it first with list_tasks, then add, update or delete tasks so the result matches what the user asked. Place each task after the prayer whose window it fits, using the prayer times you are given or can look up, and keep the number of tasks realistic for the time between prayers. Don't remove or rename tasks the user didn't ask you to touch, and never mark a task done unless asked.

When you finish, reply in one to three short sentences saying what you changed. If the request has nothing to do with planning, say so briefly and change nothing.`

const prayerTimesTool = (settings: AppSettings) =>
  betaTool({
    name: 'get_prayer_times',
    description:
      "Prayer times for one planning day, in the user's city and local time.",
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'The day, as yyyy-mm-dd.' },
      },
      required: ['date'],
      additionalProperties: false,
    },
    run: ({ date }) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new ToolError('date must be yyyy-mm-dd')
      return fmtPlanningDayTimes(settings, date)
    },
  })

export type PlannerResult = {
  tasks: Task[]
  reply: string
  changes: ScheduleChange[]
}

export const runPlanner = async ({
  apiKey,
  model,
  prompt,
  tasks,
  settings,
  viewYmd,
  todayYmd,
  signal,
}: {
  apiKey: string
  model: AiModel
  prompt: string
  tasks: Task[]
  settings: AppSettings
  viewYmd: string
  todayYmd: string
  signal?: AbortSignal
}): Promise<PlannerResult> => {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const city = findCity(settings.city)

  // Tools edit a working copy; the caller saves it only if the whole run
  // finishes, so a failure halfway leaves the schedule as it was.
  let current = tasks
  const changes: ScheduleChange[] = []

  const scheduleTools = SCHEDULE_TOOLS.map((t) =>
    betaTool({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      run: (input) => {
        const out = applyScheduleTool(
          current,
          t.name,
          input as Record<string, unknown>
        )
        if (out.isError) throw new ToolError(out.result)
        current = out.tasks
        if (out.change) changes.push(out.change)
        return out.result
      },
    })
  )

  const context = [
    `City: ${city.name}, ${city.country} (${city.tz}).`,
    `Today's planning day: ${todayYmd}.`,
    `Day open in the app: ${viewYmd}. Unless I name another day, I mean this one.`,
    `Prayer times for ${viewYmd}: ${fmtPlanningDayTimes(settings, viewYmd)}.`,
    '',
    describeDay(current, viewYmd),
  ].join('\n')

  const final = await client.beta.messages.toolRunner(
    {
      model,
      max_tokens: 16000,
      system: SYSTEM,
      tools: [...scheduleTools, prayerTimesTool(settings)],
      output_config: { effort: 'medium' },
      max_iterations: 25,
      // On a safety decline, re-run on another model instead of failing.
      ...(model === 'claude-sonnet-5-5'
        ? {
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default' as const,
          }
        : {}),
      messages: [
        {
          role: 'user',
          content: `${context}\n\nRequest: ${prompt}`,
        },
      ],
    },
    { signal }
  )

  if (final.stop_reason === 'refusal') {
    throw new Error("Claude declined this request, so nothing was changed.")
  }

  const reply = final.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('\n')
    .trim()

  return { tasks: current, reply, changes }
}

// A short, user-facing reason for a failed run.
export const plannerErrorMessage = (err: unknown) => {
  if (err instanceof Anthropic.AuthenticationError)
    return 'Your Anthropic API key was rejected. Check it in Settings.'
  if (err instanceof Anthropic.PermissionDeniedError)
    return "This API key can't use that model."
  if (err instanceof Anthropic.RateLimitError)
    return 'Rate limited by Anthropic. Wait a moment and try again.'
  if (err instanceof Anthropic.APIUserAbortError) return 'Stopped.'
  if (err instanceof Anthropic.APIConnectionError)
    return "Couldn't reach Anthropic. Check your connection."
  if (err instanceof Anthropic.APIError)
    return `Anthropic error ${err.status ?? ''}: ${err.message}`.trim()
  return err instanceof Error ? err.message : 'Something went wrong.'
}
