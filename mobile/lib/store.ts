import AsyncStorage from '@react-native-async-storage/async-storage'
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

export type Loaded<T> = { value: T; failed: boolean }

// A failed read must never look like "you have no data": every caller would
// then render blank and the next write would overwrite the real row.
export const loadKey = async <T,>(
  userId: string,
  key: string,
  fallback: T,
): Promise<Loaded<T>> => {
  const { data, error } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle()
  if (error) return { value: fallback, failed: true }
  return { value: (data?.value as T) ?? fallback, failed: false }
}

export const saveKey = async (userId: string, key: string, value: unknown) => {
  // Without the conflict target PostgREST infers it from the primary key, so
  // each save appends a row instead of updating (and the read then fails).
  await supabase.from('user_data').upsert(
    {
      user_id: userId,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,key' },
  )
}

export const signOutAndClear = async () => {
  // Nothing one account cached on this device may survive into the next one.
  try {
    const keys = await AsyncStorage.getAllKeys()
    const mine = keys.filter(k => k.startsWith('alinoor_'))
    if (mine.length) await AsyncStorage.multiRemove(mine)
  } catch {}
  // 'local' so signing out on the phone does not kill the laptop's session.
  await supabase.auth.signOut({ scope: 'local' })
}

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
