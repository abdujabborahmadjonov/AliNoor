import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cgtetucceocbldqthgiw.supabase.co'
// Public client key — same one the website ships in its bundle.
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndGV0dWNjZW9jYmxkcXRoZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njc1NzYsImV4cCI6MjA4NTE0MzU3Nn0.NGJ4sSE3kA1KPzTnUokEObM7EB-_okf3O_KRd7KFJ1s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE survives the browser→app handoff much better than tokens in the
    // URL fragment: the redirect carries only a ?code=, exchanged in-app.
    flowType: 'pkce',
  },
})
