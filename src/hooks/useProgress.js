import { useState, useCallback, useEffect } from 'react'
import { persistenceAdapter } from '../domain/progress/persistenceAdapter'
import { useStudentContext } from './useStudentContext'

/**
 * Hook to manage student progress via sessionStorage.
 * Prepares the abstraction for future migration to a database without changing components.
 */
export function useProgress() {
  const [progress, setProgress] = useState(persistenceAdapter.loadLocalProgress)
  const { studentName, studentClass, isLoggedIn } = useStudentContext()

  // Sync state to storage whenever it changes (local sync)
  useEffect(() => {
    persistenceAdapter.saveLocalProgress(progress)
  }, [progress])

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
          [challengeId]: 'syncing' // optimistic
        }
      }

      // Fire-and-forget sync to Supabase (if we have identity context)
      if (isLoggedIn) {
        persistenceAdapter.syncChallengeToSupabase({
          studentName,
          studentClass,
          challengeId,
          xpAwarded: xpReward
        }).then(result => {
          // We can optionally update syncStatus here without disrupting local XP
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
  }, [isLoggedIn, studentName, studentClass])

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
