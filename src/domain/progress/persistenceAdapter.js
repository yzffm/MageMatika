import { insertChallengeProgress } from '../../lib/supabase'

/**
 * Adapter for managing progress persistence.
 * Enforces Local-First Authority: sessionStorage is the source of truth.
 * Supabase synchronization is optional, async, and non-blocking.
 */

const PROGRESS_KEY = 'magematika_progress'

export const persistenceAdapter = {
  /**
   * Reads progress from local sessionStorage.
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
   * Asynchronously attempts to push a challenge completion to Supabase.
   * Fire-and-forget from the UI's perspective.
   * 
   * @param {Object} payload 
   * @param {string} payload.studentName
   * @param {string} payload.studentClass
   * @param {string} payload.challengeId
   * @param {number} payload.xpAwarded
   * @returns {Promise<{success: boolean, error: any}>}
   */
  syncChallengeToSupabase: async (payload) => {
    try {
      const { data, error } = await insertChallengeProgress({
        student_name: payload.studentName,
        student_class: payload.studentClass,
        challenge_id: payload.challengeId,
        xp_awarded: payload.xpAwarded
      })

      if (error) {
        console.warn(`[MageMatika] Persistence sync failed for ${payload.challengeId}. Local progress retained. Reason:`, error.message || error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (err) {
      console.warn(`[MageMatika] Persistence sync caught exception for ${payload.challengeId}. Local progress retained. Reason:`, err)
      return { success: false, error: err }
    }
  }
}
