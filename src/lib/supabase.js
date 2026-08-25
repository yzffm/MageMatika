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

/**
 * Asynchronously persists challenge progress to the proposed VS6 schema.
 * Note: If the 'challenge_progress' table does not exist or fails, this returns the error
 * so the persistence adapter can handle it gracefully.
 * 
 * Uses an upsert or relies on a UNIQUE constraint to be idempotent.
 */
export async function insertChallengeProgress(payload) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  // The proposed table relies on unique(student_name, student_class, challenge_id)
  const { data, error } = await supabase
    .from('challenge_progress')
    .upsert(
      [payload], 
      { onConflict: 'student_name,student_class,challenge_id' }
    )
    .select()

  return { data, error }
}

