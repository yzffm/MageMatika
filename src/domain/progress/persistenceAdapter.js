import { syncChallengeProgress, loadChallengeProgress } from '../../lib/supabase'

/**
 * Adapter for managing progress persistence.
 * 
 * VS8: Now uses Supabase Auth-linked tables.
 * - sessionStorage remains as a fast local cache for immediate UI updates.
 * - Supabase is the source of truth for cross-session persistence.
 * - Progress is loaded from Supabase on session restore.
 */

const PROGRESS_KEY = 'magematika_progress'

export const persistenceAdapter = {
  /**
   * Reads progress from local sessionStorage (fast cache).
   */
  loadLocalProgress: () => {
    try {
      const raw = sessionStorage.getItem(PROGRESS_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (err) {
      console.error('[MageMatika] Failed to parse progress from sessionStorage:', err)
    }
    return {
      totalXP: 0,
      completedChallenges: [],
      attempts: {},
      syncStatus: {} // challengeId -> 'syncing' | 'synced' | 'failed'
    }
  },

  /**
   * Saves progress synchronously to sessionStorage.
   */
  saveLocalProgress: (progress) => {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  },

  /**
   * Loads progress from Supabase for the authenticated student.
   * Used on session restore to hydrate local state.
   * 
   * @param {string} studentId - Supabase auth UUID
   * @returns {Promise<{ totalXP: number, completedChallenges: string[] }>}
   */
  loadRemoteProgress: async (studentId) => {
    if (!studentId) {
      return { totalXP: 0, completedChallenges: [] }
    }
    return await loadChallengeProgress(studentId)
  },

  /**
   * Syncs a single challenge completion to Supabase.
   * Fire-and-forget from the UI's perspective.
   * 
   * @param {{ studentId: string, challengeId: string, xpAwarded: number }} payload
   * @returns {Promise<{success: boolean, error: any}>}
   */
  syncChallengeToSupabase: async (payload) => {
    if (!payload.studentId) {
      console.warn('[MageMatika] No studentId for sync. Local progress retained.')
      return { success: false, error: new Error('No authenticated student') }
    }

    try {
      const result = await syncChallengeProgress({
        studentId: payload.studentId,
        challengeId: payload.challengeId,
        xpAwarded: payload.xpAwarded
      })
      return result
    } catch (err) {
      console.warn(`[MageMatika] Persistence sync caught exception for ${payload.challengeId}:`, err)
      return { success: false, error: err }
    }
  }
}
