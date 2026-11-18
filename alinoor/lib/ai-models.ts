// The models the AI planner offers. Kept apart from ai-planner.ts so pages
// can list them without loading the Anthropic SDK.
export const AI_MODELS = [
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', note: 'smarter plans' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', note: 'fast and cheap' },
] as const

export type AiModel = (typeof AI_MODELS)[number]['id']
