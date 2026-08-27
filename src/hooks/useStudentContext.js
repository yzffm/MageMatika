import { useState, useCallback, useEffect } from 'react'
import {
  signInAnonymously,
  getSession,
  signOut,
  upsertStudent,
  loadStudent
} from '../lib/supabase'

/**
 * Student session context — single abstraction for student identity.
 *
 * VS8: Now backed by Supabase Anonymous Auth.
 * - On saveStudent(): signs in anonymously, creates a `students` row.
 * - On app load: checks for existing Supabase session → auto-restores.
 * - sessionStorage is kept as a fast local cache for backward compatibility.
 *
 * Keys in sessionStorage (backward-compatible):
 *   - studentName   (string)
 *   - studentLevel  (string: 'SD' | 'SMP' | 'SMA')
 *   - studentClass  (string: '1' .. '12')
 *   - studentId     (string: Supabase auth UUID)
 */

const KEYS = {
  name: 'studentName',
  level: 'studentLevel',
  class: 'studentClass',
  id: 'studentId',
}

/** Grade ranges per level */
export const GRADE_RANGES = {
  SD: [1, 2, 3, 4, 5, 6],
  SMP: [7, 8, 9],
  SMA: [10, 11, 12],
}

/** Level display labels */
export const LEVEL_LABELS = {
  SD: 'Sekolah Dasar',
  SMP: 'Sekolah Menengah Pertama',
  SMA: 'Sekolah Menengah Atas',
}

function readLocalSession() {
  return {
    studentId: sessionStorage.getItem(KEYS.id) || '',
    studentName: sessionStorage.getItem(KEYS.name) || '',
    studentLevel: sessionStorage.getItem(KEYS.level) || '',
    studentClass: sessionStorage.getItem(KEYS.class) || '',
  }
}

function writeLocalSession({ id, name, level, kelas }) {
  sessionStorage.setItem(KEYS.id, id || '')
  sessionStorage.setItem(KEYS.name, name || '')
  sessionStorage.setItem(KEYS.level, level || '')
  sessionStorage.setItem(KEYS.class, kelas || '')
}

function clearLocalSession() {
  sessionStorage.removeItem(KEYS.id)
  sessionStorage.removeItem(KEYS.name)
  sessionStorage.removeItem(KEYS.level)
  sessionStorage.removeItem(KEYS.class)
}

/**
 * Hook for reading/writing student session context.
 *
 * Usage:
 *   const { studentName, studentLevel, studentClass, studentId, isLoggedIn, isLoading, saveStudent, clearStudent } = useStudentContext()
 */
export function useStudentContext() {
  const [session, setSession] = useState(readLocalSession)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const isLoggedIn = Boolean(
    session.studentName && session.studentLevel && session.studentClass && session.studentId
  )

  // On mount: try to restore session from Supabase
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const { user } = await getSession()
        if (cancelled) return

        if (user) {
          // We have a Supabase session — load the student profile
          const { data: profile } = await loadStudent(user.id)
          if (cancelled) return

          if (profile) {
            const restored = {
              studentId: profile.id,
              studentName: profile.name,
              studentLevel: profile.level,
              studentClass: profile.grade,
            }
            writeLocalSession({
              id: profile.id,
              name: profile.name,
              level: profile.level,
              kelas: profile.grade
            })
            setSession(restored)
          }
        }
      } catch (err) {
        console.warn('[MageMatika] Session restore failed:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  const saveStudent = useCallback(async ({ name, level, kelas }) => {
    const trimmedName = (name || '').trim()
    const trimmedLevel = (level || '').trim()
    const trimmedClass = String(kelas || '').trim()

    setAuthError(null)

    try {
      // Step 1: Sign in anonymously to get a UUID
      const { user, error: authErr } = await signInAnonymously()
      if (authErr || !user) {
        console.error('[MageMatika] Anonymous sign-in failed:', authErr)
        setAuthError('Gagal membuat sesi. Periksa koneksi internet Anda.')
        // Fallback: still save locally so the app is usable offline
        const fallbackSession = {
          studentId: '',
          studentName: trimmedName,
          studentLevel: trimmedLevel,
          studentClass: trimmedClass,
        }
        writeLocalSession({ id: '', name: trimmedName, level: trimmedLevel, kelas: trimmedClass })
        setSession(fallbackSession)
        return
      }

      // Step 2: Upsert student profile in the `students` table
      const { error: profileErr } = await upsertStudent({
        id: user.id,
        name: trimmedName,
        level: trimmedLevel,
        grade: trimmedClass
      })

      if (profileErr) {
        console.error('[MageMatika] Student profile upsert failed:', profileErr)
        setAuthError('Gagal menyimpan profil. Progress mungkin tidak tersinkronisasi.')
      }

      // Step 3: Update local state
      const newSession = {
        studentId: user.id,
        studentName: trimmedName,
        studentLevel: trimmedLevel,
        studentClass: trimmedClass,
      }
      writeLocalSession({ id: user.id, name: trimmedName, level: trimmedLevel, kelas: trimmedClass })
      setSession(newSession)
    } catch (err) {
      console.error('[MageMatika] saveStudent unexpected error:', err)
      setAuthError('Terjadi kesalahan. Coba lagi.')
      // Fallback: save locally
      const fallbackSession = {
        studentId: '',
        studentName: trimmedName,
        studentLevel: trimmedLevel,
        studentClass: trimmedClass,
      }
      writeLocalSession({ id: '', name: trimmedName, level: trimmedLevel, kelas: trimmedClass })
      setSession(fallbackSession)
    }
  }, [])

  const clearStudent = useCallback(async () => {
    try {
      await signOut()
    } catch (err) {
      console.warn('[MageMatika] Sign out failed:', err)
    }
    clearLocalSession()
    // Also clear progress from sessionStorage
    sessionStorage.removeItem('magematika_progress')
    setSession({ studentId: '', studentName: '', studentLevel: '', studentClass: '' })
    setAuthError(null)
  }, [])

  return {
    studentId: session.studentId,
    studentName: session.studentName,
    studentLevel: session.studentLevel,
    studentClass: session.studentClass,
    isLoggedIn,
    isLoading,
    authError,
    saveStudent,
    clearStudent,
  }
}
