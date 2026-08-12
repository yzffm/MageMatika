import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Will be a no-op until .env.local is configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Insert progress (skor checkpoint AR) ke Supabase table 'progress'.
 * Schema: { student_name, class, location_id, checkpoint_score }
 * Returns { data, error }.
 * Silently returns { data: null, error: 'Supabase not configured' } if client is missing.
 */
export async function insertProgress(payload) {
  if (!supabase) {
    console.warn('[MageMatika] Supabase not configured. Skipping insert.')
    return { data: null, error: 'Supabase not configured' }
  }

  const { data, error } = await supabase
    .from('progress')
    .insert([payload])
    .select()

  if (error) {
    console.error('[MageMatika] Supabase insert error:', error)
  }
  return { data, error }
}
