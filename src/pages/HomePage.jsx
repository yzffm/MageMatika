import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentContext } from '../hooks/useStudentContext.js'
import FormSiswa from '../components/FormSiswa.jsx'
import './HomePage.css'

/**
 * Landing / Onboarding page.
 *
 * If student already has a session, redirects to /home.
 * Otherwise shows the onboarding form.
 *
 * Design reference: Stitch "Masuk ke MageMatika" screen.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, saveStudent } = useStudentContext()

  // If student already logged in, redirect to personalized home
  useEffect(() => {
    if (isLoggedIn) {
      // Use replace so back button doesn't loop
      navigate('/home', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (isLoggedIn) {
    return null
  }

  const handleFormSubmit = ({ name, level, kelas }) => {
    saveStudent({ name, level, kelas })
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
