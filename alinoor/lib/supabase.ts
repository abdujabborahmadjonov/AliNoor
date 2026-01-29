import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cgtetucceocbldqthgiw.supabase.co"
const supabaseAnonKey = "sb_publishable_MnSfYeUIrP1itiggwbzgrQ_qPa8v3hi"

console.log('SUPABASE URL:', supabaseUrl)
console.log('SUPABASE KEY:', supabaseAnonKey ? 'loaded' : 'missing')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars are missing')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)