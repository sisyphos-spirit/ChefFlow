import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qvyxctupttxjfczcgjxs.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eXhjdHVwdHR4amZjemNnanhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTIyNjUsImV4cCI6MjA1OTUyODI2NX0.ELRw3k0Yx6Kxu1XON-d17PTmJq5AwThaVbKZo_IeEvQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})