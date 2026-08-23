import { useState, useCallback, useEffect } from 'react'

const PROGRESS_KEY = 'magematika_progress'

function readProgress() {
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
    attempts: {}
  }
}

/**
 * Hook to manage student progress via sessionStorage.
 * Prepares the abstraction for future migration to a database without changing components.
 */
export function useProgress() {
  const [progress, setProgress] = useState(readProgress)

  // Sync state to storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
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
      return {
        ...prev,
        totalXP: prev.totalXP + xpReward,
        completedChallenges: [...prev.completedChallenges, challengeId],
        attempts: {
          ...prev.attempts,
          [challengeId]: currentAttempts + 1
        }
      }
    })
  }, [])

  return {
    totalXP: progress.totalXP,
    completedChallenges: progress.completedChallenges,
    isChallengeCompleted,
    getAttempts,
    recordAttempt,
    completeChallenge
  }
}
