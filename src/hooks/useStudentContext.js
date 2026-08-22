import { useState, useCallback } from 'react'

/**
 * Student session context — single abstraction for student identity.
 *
 * Stores in sessionStorage for persistence within a browser session.
 * Keys:
 *   - studentName   (string)
 *   - studentLevel  (string: 'SD' | 'SMP' | 'SMA')
 *   - studentClass  (string: '1' .. '12')
 *
 * Backward-compatible: existing code that reads
 * sessionStorage.getItem('studentName') and sessionStorage.getItem('studentClass')
 * will continue to work.
 */

const KEYS = {
  name: 'studentName',
  level: 'studentLevel',
  class: 'studentClass',
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

function readSession() {
  return {
    studentName: sessionStorage.getItem(KEYS.name) || '',
    studentLevel: sessionStorage.getItem(KEYS.level) || '',
    studentClass: sessionStorage.getItem(KEYS.class) || '',
  }
}

/**
 * Hook for reading/writing student session context.
 *
 * Usage:
 *   const { studentName, studentLevel, studentClass, isLoggedIn, saveStudent, clearStudent } = useStudentContext()
 */
export function useStudentContext() {
  const [session, setSession] = useState(readSession)

  const isLoggedIn = Boolean(
    session.studentName && session.studentLevel && session.studentClass
  )

  const saveStudent = useCallback(({ name, level, kelas }) => {
    const trimmedName = (name || '').trim()
    const trimmedLevel = (level || '').trim()
    const trimmedClass = String(kelas || '').trim()

    sessionStorage.setItem(KEYS.name, trimmedName)
    sessionStorage.setItem(KEYS.level, trimmedLevel)
    sessionStorage.setItem(KEYS.class, trimmedClass)

    setSession({
      studentName: trimmedName,
      studentLevel: trimmedLevel,
      studentClass: trimmedClass,
    })
  }, [])

  const clearStudent = useCallback(() => {
    sessionStorage.removeItem(KEYS.name)
    sessionStorage.removeItem(KEYS.level)
    sessionStorage.removeItem(KEYS.class)

    setSession({ studentName: '', studentLevel: '', studentClass: '' })
  }, [])

  return {
    studentName: session.studentName,
    studentLevel: session.studentLevel,
    studentClass: session.studentClass,
    isLoggedIn,
    saveStudent,
    clearStudent,
  }
}
