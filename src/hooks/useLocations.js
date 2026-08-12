import { useState, useEffect } from 'react'

/**
 * Fetch data checkpoint dari /data/locations.json (runtime fetch).
 * Dipakai oleh React app (Layer 1 & 2) — halaman AR statis juga fetch file yang sama.
 */
export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/locations.json')
      .then(res => res.json())
      .then(data => { setLocations(data); setLoading(false) })
      .catch(err => {
        console.error('[MageMatika] Gagal load locations.json:', err)
        setLoading(false)
      })
  }, [])

  return { locations, loading }
}
