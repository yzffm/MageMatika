import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentContext } from '../hooks/useStudentContext.js'
import FormSiswa from '../components/FormSiswa.jsx'
import './HomePage.css'

/**
 * Landing / Onboarding page.
 *
 * VS8: Now handles async Supabase auth via saveStudent.
 * On mount, checks if a Supabase session already exists (auto-restore).
 * Shows a loading state while the session check is in progress.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading, authError, saveStudent } = useStudentContext()

  // If student already logged in (session restored), redirect to personalized home
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/home', { replace: true })
    }
  }, [isLoggedIn, isLoading, navigate])

  // Show loading spinner while checking for existing Supabase session
  if (isLoading) {
    return (
      <div className="landing-page">
        <div className="landing-bg" />
        <div className="landing-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'white', marginTop: '1rem', opacity: 0.8 }}>Memulihkan sesi...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return null
  }

  const handleFormSubmit = async ({ name, level, kelas }) => {
    await saveStudent({ name, level, kelas })
    navigate('/home')
  }

  return (
    <div className="landing-page">
      {/* Gradient background with organic orbs */}
      <div className="landing-bg" />
      <div className="landing-orb landing-orb--1" />
      <div className="landing-orb landing-orb--2" />

      <div className="landing-content">
        {/* Logo header */}
        <header className="landing-header animate-fade-in-up">
          <h1 className="landing-logo">
            <span className="material-symbols-outlined landing-logo-icon">explore</span>
            MageMatika
          </h1>
        </header>

        {/* Auth error notice */}
        {authError && (
          <div className="landing-auth-error animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="material-symbols-outlined">warning</span>
            <p>{authError}</p>
          </div>
        )}

        {/* Form card */}
        <div className="landing-form-wrap animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <FormSiswa onSubmit={handleFormSubmit} />
        </div>

        {/* Feature highlights */}
        <div className="landing-features animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <span className="material-symbols-outlined">map</span>
            </div>
            <span className="landing-feature-text">Peta Interaktif</span>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <span className="material-symbols-outlined">calculate</span>
            </div>
            <span className="landing-feature-text">Matematika Menyenangkan</span>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <span className="material-symbols-outlined">view_in_ar</span>
            </div>
            <span className="landing-feature-text">Pengalaman AR</span>
          </div>
        </div>
      </div>
    </div>
  )
}
