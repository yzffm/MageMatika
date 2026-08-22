import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStudentContext, LEVEL_LABELS } from '../hooks/useStudentContext.js'
import './PersonalizedHomePage.css'

/**
 * Personalized Home — central hub after onboarding.
 *
 * Shows student greeting + level, entry points to Explore/Missions/Progress.
 * Requires student session; redirects to / if missing.
 *
 * Design reference: Stitch "MageMatika - Home" screen.
 */
export default function PersonalizedHomePage() {
  const navigate = useNavigate()
  const { studentName, studentLevel, studentClass, isLoggedIn } = useStudentContext()

  // Guard: redirect to onboarding if no session
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  const levelLabel = LEVEL_LABELS[studentLevel] || studentLevel
  const firstName = studentName.split(' ')[0]

  return (
    <div className="home-page">
      {/* Texture overlay for organic feel */}
      <div className="home-texture" />

      {/* Top app bar */}
      <header className="home-topbar">
        <div className="home-topbar-left">
          <div className="home-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <h1 className="home-brand">MageMatika</h1>
        </div>
        <div className="home-xp-badge">
          <span className="material-symbols-outlined home-xp-icon">stars</span>
          <span className="home-xp-text">0 XP</span>
        </div>
      </header>

      <main className="home-main">
        {/* Hero section */}
        <section className="home-hero animate-fade-in-up">
          <div className="home-greeting">
            <span className="home-greeting-wave">👋</span>
            <p className="home-greeting-text">
              Halo, <strong>{firstName}</strong>!
            </p>
          </div>
          <div className="home-student-badge">
            <span className="home-student-level">{studentLevel}</span>
            <span className="home-student-class">Kelas {studentClass}</span>
            <span className="home-student-separator">•</span>
            <span className="home-student-level-full">{levelLabel}</span>
          </div>
          <h2 className="home-headline">
            Temukan Matematika di Balik Budaya Magetan
          </h2>
          <p className="home-subheadline">
            Jelajahi budaya, temukan pola, dan pecahkan tantangan.
          </p>
        </section>

        {/* Action buttons */}
        <div className="home-actions animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            className="home-action-btn home-action-btn--primary"
            onClick={() => navigate('/peta')}
          >
            Mulai Eksplorasi
          </button>
          <button
            className="home-action-btn home-action-btn--secondary"
            onClick={() => {/* Missions - coming soon */}}
            disabled
          >
            Lihat Misi
          </button>
        </div>

        {/* Feature cards */}
        <section className="home-cards stagger-children" style={{ animationDelay: '0.2s' }}>
          {/* Explore Magetan */}
          <div
            className="home-card home-card--explore"
            onClick={() => navigate('/peta')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/peta')}
          >
            <div className="home-card-icon">
              <span className="material-symbols-outlined">explore</span>
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Jelajahi Magetan</h3>
              <p className="home-card-desc">
                Peta interaktif 18 kecamatan dengan objek budaya dan matematika
              </p>
            </div>
            <span className="material-symbols-outlined home-card-arrow">arrow_forward</span>
          </div>

          {/* Missions — placeholder */}
          <div className="home-card home-card--missions home-card--disabled">
            <div className="home-card-icon home-card-icon--secondary">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Misi Matematika</h3>
              <p className="home-card-desc">
                Tantangan matematika berdasarkan jenjangmu
              </p>
              <span className="home-card-coming">Segera Hadir</span>
            </div>
          </div>

          {/* Progress — placeholder */}
          <div className="home-card home-card--progress home-card--disabled">
            <div className="home-card-icon home-card-icon--tertiary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Progress Kamu</h3>
              <p className="home-card-desc">
                XP, badge, dan perjalanan belajarmu
              </p>
              <span className="home-card-coming">Segera Hadir</span>
            </div>
          </div>
        </section>

        {studentLevel === 'SMA' && (
          <div className="home-sma-notice animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <span className="material-symbols-outlined">info</span>
            <p>
              Konten untuk SMA sedang dalam pengembangan. Saat ini kamu dapat menjelajahi
              materi SD dan SMP yang tersedia.
            </p>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="home-bottomnav">
        <button className="home-nav-item home-nav-item--active" onClick={() => navigate('/home')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="home-nav-label">Home</span>
        </button>
        <button className="home-nav-item" onClick={() => navigate('/peta')}>
          <span className="material-symbols-outlined">explore</span>
          <span className="home-nav-label">Explore</span>
        </button>
        <button className="home-nav-item" disabled>
          <span className="material-symbols-outlined">task_alt</span>
          <span className="home-nav-label">Missions</span>
        </button>
        <button className="home-nav-item" disabled>
          <span className="material-symbols-outlined">trending_up</span>
          <span className="home-nav-label">Progress</span>
        </button>
      </nav>
    </div>
  )
}
