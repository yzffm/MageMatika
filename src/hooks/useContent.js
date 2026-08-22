import { useState, useEffect } from 'react'

/**
 * Fetches the cultural objects catalog.
 * Cultural objects represent real-world locations and context, independent of education level.
 */
export function useCulturalObjects() {
  const [culturalObjects, setCulturalObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/culturalObjects.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cultural objects')
        return res.json()
      })
      .then(data => {
        setCulturalObjects(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('[MageMatika] Gagal load culturalObjects.json:', err)
        setError(err)
        setLoading(false)
      })
  }, [])

  return { culturalObjects, loading, error }
}

/**
 * Fetches learning modules, optionally filtered by culturalObjectId and student level.
 * Learning modules represent educational content (mathematics) for a specific level.
 */
export function useLearningModules({ level, culturalObjectId } = {}) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/learningModules.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch learning modules')
        return res.json()
      })
      .then(data => {
        let filtered = data
        if (level) {
          filtered = filtered.filter(m => m.level === level)
        }
        if (culturalObjectId) {
          filtered = filtered.filter(m => m.culturalObjectId === culturalObjectId)
        }
        setModules(filtered)
        setLoading(false)
      })
      .catch(err => {
        console.error('[MageMatika] Gagal load learningModules.json:', err)
        setError(err)
        setLoading(false)
      })
  }, [level, culturalObjectId])

  return { modules, loading, error }
}
