import { useState } from 'react'
import { User, GraduationCap, ArrowRight } from 'lucide-react'
import './FormSiswa.css'

/**
 * Student identity form. Saves to sessionStorage and calls onSubmit callback.
 */
export default function FormSiswa({ onSubmit }) {
  const [name, setName] = useState(() => sessionStorage.getItem('studentName') || '')
  const [kelas, setKelas] = useState(() => sessionStorage.getItem('studentClass') || '')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!kelas.trim()) newErrors.kelas = 'Kelas wajib diisi'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    sessionStorage.setItem('studentName', name.trim())
    sessionStorage.setItem('studentClass', kelas.trim())
    setErrors({})
    onSubmit?.({ name: name.trim(), kelas: kelas.trim() })
  }

  return (
    <form className="form-siswa glass-card" onSubmit={handleSubmit} id="form-siswa">
      <h2 className="form-siswa-title">Masuk untuk Mulai</h2>

      <div className="form-field">
        <label htmlFor="input-name" className="form-label">
          <User size={14} />
          Nama Lengkap
        </label>
        <input
          id="input-name"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="Masukkan nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="input-kelas" className="form-label">
          <GraduationCap size={14} />
          Kelas
        </label>
        <input
          id="input-kelas"
          type="text"
          className={`form-input ${errors.kelas ? 'form-input--error' : ''}`}
          placeholder="cth: 8A"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
        />
        {errors.kelas && <span className="form-error">{errors.kelas}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-mulai">
        Mulai Jelajah
        <ArrowRight size={18} />
      </button>
    </form>
  )
}
