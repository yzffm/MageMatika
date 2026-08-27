import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStudentContext, LEVEL_LABELS } from '../hooks/useStudentContext.js'
import { useProgress } from '../hooks/useProgress.js'
import BottomNav from '../components/BottomNav.jsx'
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
  const { studentName, studentLevel, studentClass, isLoggedIn, isLoading, clearStudent } = useStudentContext()
  const { totalXP } = useProgress()

  // Guard: redirect to onboarding if no session (wait for auth check first)
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-texture" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

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
          <div className="home-avatar" onClick={async () => { await clearStudent(); navigate('/') }} role="button" tabIndex={0} title="Keluar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <h1 className="home-brand">MageMatika</h1>
        </div>
        <div className="home-xp-badge">
          <span className="material-symbols-outlined home-xp-icon">stars</span>
          <span className="home-xp-text">{totalXP} XP</span>
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
            onClick={() => navigate('/missions')}
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

          {/* Missions */}
          <div 
            className="home-card home-card--missions"
            onClick={() => navigate('/missions')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/missions')}
          >
            <div className="home-card-icon home-card-icon--secondary">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Misi Matematika</h3>
              <p className="home-card-desc">
                Tantangan matematika berdasarkan jenjangmu
              </p>
            </div>
            <span className="material-symbols-outlined home-card-arrow">arrow_forward</span>
          </div>

          {/* Progress */}
          <div 
            className="home-card home-card--progress"
            onClick={() => navigate('/progress')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/progress')}
          >
            <div className="home-card-icon home-card-icon--tertiary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Progress Kamu</h3>
              <p className="home-card-desc">
                XP, badge, dan perjalanan belajarmu
              </p>
            </div>
            <span className="material-symbols-outlined home-card-arrow">arrow_forward</span>
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
      <BottomNav />
    </div>
  )
}
