import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Trophy, CheckCircle, TrendingUp } from 'lucide-react'
import { useStudentContext, LEVEL_LABELS } from '../hooks/useStudentContext'
import { useChallenges } from '../hooks/useChallenges'
import { useCulturalObjects, useLearningModules } from '../hooks/useContent'
import { useProgress } from '../hooks/useProgress'
import { getCompletedChallengesForLevel, calculateCompletionPercentage } from '../domain/progress/calculations'
import './ProgressPage.css'

export default function ProgressPage() {
  const navigate = useNavigate()
  const { studentLevel, isLoggedIn } = useStudentContext()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const { challenges, loading: loadingChallenges } = useChallenges({ level: studentLevel })
  const { modules, loading: loadingModules } = useLearningModules()
  const { culturalObjects, loading: loadingObjects } = useCulturalObjects()
  const progress = useProgress()

  if (!isLoggedIn) return null

  const isLoading = loadingChallenges || loadingModules || loadingObjects

  if (isLoading) {
    return (
      <div className="page-container progress-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Memuat progress...</p>
        </div>
      </div>
    )
  }

  const completedCount = getCompletedChallengesForLevel(progress.completedChallenges, challenges)
  const totalCount = challenges.length
  const completionPercentage = calculateCompletionPercentage(completedCount, totalCount)

  // Get completed challenges that are valid for this level
  const validCompletedChallengeIds = new Set(challenges.map(c => c.id))
  const completedChallengesForThisLevel = progress.completedChallenges
    .filter(id => validCompletedChallengeIds.has(id))
    .map(id => challenges.find(c => c.id === id))

  const levelLabel = LEVEL_LABELS[studentLevel] || studentLevel

  return (
    <div className="page-container progress-page">
      <header className="page-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate('/home')}>
          <ChevronLeft size={18} /> Kembali
        </button>
      </header>

      <main className="progress-main stagger-children">
        <div className="progress-header glass-card">
          <div className="progress-header-icon">
            <TrendingUp size={32} />
          </div>
          <h1 className="progress-title">Progress Kamu</h1>
          <p className="progress-subtitle">Jenjang {levelLabel}</p>
        </div>

        <section className="progress-stats glass-card">
          <div className="xp-container">
            <Trophy size={28} className="xp-icon" />
            <div className="xp-details">
              <span className="xp-value">{progress.totalXP}</span>
              <span className="xp-label">Total XP</span>
            </div>
          </div>

          <div className="progress-divider" />

          <div className="completion-container">
            <div className="completion-text">
              <span className="completion-ratio">{completedCount} / {totalCount} Misi</span>
              <span className="completion-percent">{completionPercentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </section>

        <section className="completed-list-section">
          <h2 className="section-title">Tantangan Selesai</h2>
          
          {completedChallengesForThisLevel.length === 0 ? (
            <div className="empty-state glass-card">
              <p>Belum ada tantangan yang diselesaikan.</p>
            </div>
          ) : (
            <ul className="completed-list glass-card">
              {completedChallengesForThisLevel.map(challenge => {
                const module = modules.find(m => m.id === challenge.learningModuleId)
                const culturalObject = culturalObjects.find(c => c.id === module?.culturalObjectId)
                
                return (
                  <li key={challenge.id} className="completed-list-item">
                    <CheckCircle size={18} className="completed-icon" />
                    <div className="completed-item-details">
                      <span className="completed-item-title">{challenge.title}</span>
                      <span className="completed-item-context">
                        {culturalObject ? culturalObject.name : 'Objek Budaya'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
