import { useState, useCallback, useEffect } from 'react'
import { persistenceAdapter } from '../domain/progress/persistenceAdapter'
import { useStudentContext } from './useStudentContext'

/**
 * Hook to manage student progress.
 * 
 * VS8: Hydrates from Supabase on session restore, then uses
 * local-first optimistic updates for immediate UI responsiveness.
 */
export function useProgress() {
  const [progress, setProgress] = useState(persistenceAdapter.loadLocalProgress)
  const [isHydrated, setIsHydrated] = useState(false)
  const { studentId, isLoggedIn, isLoading: isAuthLoading } = useStudentContext()

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    persistenceAdapter.saveLocalProgress(progress)
  }, [progress])

  // Hydrate progress from Supabase when auth is ready and we have a studentId
  useEffect(() => {
    if (isAuthLoading || !studentId || isHydrated) return

    let cancelled = false

    async function hydrateFromSupabase() {
      try {
        const remote = await persistenceAdapter.loadRemoteProgress(studentId)
        if (cancelled) return

        if (remote.completedChallenges.length > 0 || remote.totalXP > 0) {
          setProgress(prev => {
            // Merge: remote is source of truth, but don't lose local attempts
            const mergedChallenges = Array.from(new Set([
              ...remote.completedChallenges,
              ...prev.completedChallenges
            ]))
            return {
              ...prev,
              totalXP: Math.max(remote.totalXP, prev.totalXP),
              completedChallenges: mergedChallenges,
            }
          })
        }
      } catch (err) {
        console.warn('[MageMatika] Failed to hydrate progress from Supabase:', err)
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    }

    hydrateFromSupabase()
    return () => { cancelled = true }
  }, [studentId, isAuthLoading, isHydrated])

  const isChallengeCompleted = useCallback((challengeId) => {
    return progress.completedChallenges.includes(challengeId)
  }, [progress.completedChallenges])

  const getAttempts = useCallback((challengeId) => {
    return progress.attempts[challengeId] || 0
  }, [progress.attempts])

  const recordAttempt = useCallback((challengeId) => {
    setProgress(prev => {
      const currentAttempts = prev.attempts[challengeId] || 0
      return {
        ...prev,
        attempts: {
          ...prev.attempts,
          [challengeId]: currentAttempts + 1
        }
      }
    })
  }, [])

  const completeChallenge = useCallback((challengeId, xpReward) => {
    setProgress(prev => {
      // Prevent duplicate completion
      if (prev.completedChallenges.includes(challengeId)) {
        return prev
      }

      const currentAttempts = prev.attempts[challengeId] || 0
      
      const nextProgress = {
        ...prev,
        totalXP: prev.totalXP + xpReward,
        completedChallenges: [...prev.completedChallenges, challengeId],
        attempts: {
          ...prev.attempts,
          [challengeId]: currentAttempts + 1
        },
        syncStatus: {
          ...(prev.syncStatus || {}),
          [challengeId]: 'syncing'
        }
      }

      // Fire-and-forget sync to Supabase
      if (studentId) {
        persistenceAdapter.syncChallengeToSupabase({
          studentId,
          challengeId,
          xpAwarded: xpReward
        }).then(result => {
          setProgress(p => ({
            ...p,
            syncStatus: {
              ...(p.syncStatus || {}),
              [challengeId]: result.success ? 'synced' : 'failed'
            }
          }))
        })
      }

      return nextProgress
    })
  }, [studentId])

  return {
    totalXP: progress.totalXP,
    completedChallenges: progress.completedChallenges,
    isChallengeCompleted,
    getAttempts,
    recordAttempt,
    completeChallenge,
    syncStatus: progress.syncStatus || {}
  }
}
