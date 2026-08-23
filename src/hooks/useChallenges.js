import { useState, useEffect } from 'react'

/**
 * Hook to fetch and filter challenges based on level and optionally module ID.
 * Follows the existing useContent architecture pattern.
 */
export function useChallenges({ level, learningModuleId } = {}) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchChallenges() {
      try {
        setLoading(true)
        const res = await fetch('/data/challenges.json')
        if (!res.ok) throw new Error('Gagal memuat data tantangan.')
        
        const data = await res.json()
        
        let filtered = data.filter(c => c.enabled !== false)

        if (level) {
          filtered = filtered.filter(c => c.level === level)
        }
        
        if (learningModuleId) {
          filtered = filtered.filter(c => c.learningModuleId === learningModuleId)
        }
        
        setChallenges(filtered)
      } catch (err) {
        console.error('[MageMatika] Error fetching challenges:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [level, learningModuleId])

  return { challenges, loading, error }
}
