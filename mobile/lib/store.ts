import { supabase } from './supabase'

// The app is signed-in-only, so data lives in the same user_data table the
// website syncs to — phone and web always see the same tasks and settings.

export type AppSettings = {
  city: string
  method: 'MuslimWorldLeague' | 'ISNA' | 'Egyptian' | 'UmmAlQura' | 'Karachi'
  madhab: 'Hanafi' | 'Shafi'
  displayName: string
}

export type Task = {
  id: string
  date: string
  anchor: string
  title: string
  done: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  city: 'Tashkent',
  method: 'MuslimWorldLeague',
  madhab: 'Hanafi',
  displayName: '',
}

export const loadKey = async <T,>(
  userId: string,
  key: string,
  fallback: T,
): Promise<T> => {
  const { data } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle()
  return (data?.value as T) ?? fallback
}

export const saveKey = async (userId: string, key: string, value: unknown) => {
  await supabase.from('user_data').upsert({
    user_id: userId,
    key,
    value,
    updated_at: new Date().toISOString(),
  })
}

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
