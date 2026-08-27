import { useState } from 'react'
import { User, GraduationCap, School, ArrowRight, Loader } from 'lucide-react'
import { GRADE_RANGES } from '../hooks/useStudentContext.js'
import './FormSiswa.css'

/**
 * Student onboarding form.
 *
 * Fields: Nama Lengkap, Jenjang (SD/SMP/SMA), Kelas (dynamic based on jenjang).
 * Calls onSubmit({ name, level, kelas }) on valid submission.
 * 
 * VS8: onSubmit is now async (Supabase auth). The form shows a loading
 * state while the auth call is in progress.
 */
export default function FormSiswa({ onSubmit }) {
  const [name, setName] = useState(() => sessionStorage.getItem('studentName') || '')
  const [level, setLevel] = useState(() => sessionStorage.getItem('studentLevel') || '')
  const [kelas, setKelas] = useState(() => sessionStorage.getItem('studentClass') || '')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableGrades = level && GRADE_RANGES[level] ? GRADE_RANGES[level] : []

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel)
    setKelas('')
    if (errors.level) {
      setErrors(prev => ({ ...prev, level: undefined }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!level) newErrors.level = 'Jenjang wajib dipilih'
    if (!kelas) newErrors.kelas = 'Kelas wajib dipilih'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      await onSubmit?.({ name: name.trim(), level, kelas })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="form-siswa" onSubmit={handleSubmit} id="form-siswa">
      <div className="form-siswa-header">
        <h2 className="form-siswa-title">Mari Kenalan Dulu 👋</h2>
        <p className="form-siswa-subtitle">
          Siap menemukan matematika di balik budaya Magetan?
        </p>
      </div>

      {/* Nama */}
      <div className="form-field">
        <label htmlFor="input-name" className="form-label">
          <User size={14} />
          Nama Lengkap
        </label>
        <input
          id="input-name"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="Penjelajah Muda"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
          }}
          autoComplete="name"
          disabled={isSubmitting}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      {/* Jenjang */}
      <div className="form-field">
        <label className="form-label">
          <School size={14} />
          Jenjang
        </label>
        <div className="form-jenjang-group">
          {['SD', 'SMP', 'SMA'].map((j) => {
            const isActive = level === j
            const isSMA = j === 'SMA'
            return (
              <button
                key={j}
                type="button"
                className={[
                  'form-jenjang-btn',
                  isActive ? 'form-jenjang-btn--active' : '',
                  isSMA ? 'form-jenjang-btn--future' : '',
                ].join(' ')}
                onClick={() => handleLevelChange(j)}
                aria-pressed={isActive}
                disabled={isSubmitting}
              >
                <span className="form-jenjang-label">{j}</span>
                {isSMA && <span className="form-jenjang-badge">Segera Hadir</span>}
              </button>
            )
          })}
        </div>
        {errors.level && <span className="form-error">{errors.level}</span>}
      </div>

      {/* Kelas — only shown when jenjang is selected */}
      {level && availableGrades.length > 0 && (
        <div className="form-field">
          <label className="form-label">
            <GraduationCap size={14} />
            Kelas
          </label>
          <div className="form-kelas-group">
            {availableGrades.map((grade) => (
              <button
                key={grade}
                type="button"
                className={[
                  'form-kelas-btn',
                  kelas === String(grade) ? 'form-kelas-btn--active' : '',
                ].join(' ')}
                onClick={() => {
                  setKelas(String(grade))
                  if (errors.kelas) setErrors(prev => ({ ...prev, kelas: undefined }))
                }}
                aria-pressed={kelas === String(grade)}
                disabled={isSubmitting}
              >
                {grade}
              </button>
            ))}
          </div>
          {errors.kelas && <span className="form-error">{errors.kelas}</span>}
        </div>
      )}

      <button 
        type="submit" 
        className="form-submit-btn" 
        id="btn-mulai"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader size={18} className="spin-animation" />
            Menyiapkan...
          </>
        ) : (
          <>
            Mulai Jelajah
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}
