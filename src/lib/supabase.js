import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Will be a no-op until .env.local is configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ============================================================
// AUTH HELPERS
// ============================================================

/**
 * Sign in anonymously. Creates a new auth.users record with a UUID.
 * Supabase persists the session in localStorage automatically.
 * @returns {{ user: object|null, error: object|null }}
 */
export async function signInAnonymously() {
  if (!supabase) {
    return { user: null, error: new Error('Supabase not configured') }
  }
  const { data, error } = await supabase.auth.signInAnonymously()
  return { user: data?.user || null, error }
}

/**
 * Get the current auth session (auto-restored from localStorage by Supabase).
 * @returns {{ session: object|null, user: object|null }}
 */
export async function getSession() {
  if (!supabase) {
    return { session: null, user: null }
  }
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('[MageMatika] getSession error:', error.message)
    return { session: null, user: null }
  }
  return { session, user: session?.user || null }
}

/**
 * Sign out and clear the Supabase session.
 */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

// ============================================================
// STUDENT PROFILE (students table)
// ============================================================

/**
 * Upsert a student profile linked to the authenticated user's UUID.
 * @param {{ id: string, name: string, level: string, grade: string }} profile
 */
export async function upsertStudent(profile) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const { data, error } = await supabase
    .from('students')
    .upsert([{
      id: profile.id,
      name: profile.name,
      level: profile.level,
      grade: profile.grade
    }], { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[MageMatika] upsertStudent error:', error)
  }
  return { data, error }
}

/**
 * Load student profile by auth UUID.
 * @param {string} userId
 */
export async function loadStudent(userId) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// ============================================================
// CHALLENGE PROGRESS (challenge_progress table, auth-linked)
// ============================================================

/**
 * Load all challenge progress for a student from Supabase.
 * @param {string} studentId - auth UUID
 * @returns {{ completedChallenges: string[], totalXP: number }}
 */
export async function loadChallengeProgress(studentId) {
  if (!supabase) {
    return { completedChallenges: [], totalXP: 0 }
  }
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('challenge_id, xp_awarded')
    .eq('student_id', studentId)

  if (error) {
    console.warn('[MageMatika] loadChallengeProgress error:', error.message)
    return { completedChallenges: [], totalXP: 0 }
  }

  const completedChallenges = (data || []).map(row => row.challenge_id)
  const totalXP = (data || []).reduce((sum, row) => sum + (row.xp_awarded || 0), 0)
  return { completedChallenges, totalXP }
}

/**
 * Sync a single challenge completion to Supabase.
 * Uses upsert with UNIQUE(student_id, challenge_id) for idempotency.
 * @param {{ studentId: string, challengeId: string, xpAwarded: number }} payload
 */
export async function syncChallengeProgress(payload) {
  if (!supabase) {
    return { success: false, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase
    .from('challenge_progress')
    .upsert([{
      student_id: payload.studentId,
      challenge_id: payload.challengeId,
      xp_awarded: payload.xpAwarded
    }], { onConflict: 'student_id,challenge_id' })
    .select()

  if (error) {
    console.warn(`[MageMatika] syncChallengeProgress failed for ${payload.challengeId}:`, error.message)
    return { success: false, error }
  }
  return { success: true, data }
}

// ============================================================
// LEGACY FUNCTIONS (kept for backward compatibility during migration)
// ============================================================

/**
 * @deprecated Use syncChallengeProgress instead.
 * Legacy insert for the old 'progress' table (AR checkpoints).
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
