import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Flag } from 'lucide-react'
import { useStudentContext } from '../hooks/useStudentContext'
import { useChallenges } from '../hooks/useChallenges'
import { useCulturalObjects, useLearningModules } from '../hooks/useContent'
import { useProgress } from '../hooks/useProgress'
import { getCompletedChallengesForLevel } from '../domain/progress/calculations'
import MissionCard from '../features/challenge/components/MissionCard'
import BottomNav from '../components/BottomNav.jsx'
import './MissionsPage.css'

export default function MissionsPage() {
  const navigate = useNavigate()
  const { studentLevel, isLoggedIn, isLoading: isAuthLoading } = useStudentContext()

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, isAuthLoading, navigate])

  const { challenges, loading: loadingChallenges } = useChallenges({ level: studentLevel })
  const { modules, loading: loadingModules } = useLearningModules()
  const { culturalObjects, loading: loadingObjects } = useCulturalObjects()
  const progress = useProgress()

  if (!isLoggedIn) return null

  const isLoading = loadingChallenges || loadingModules || loadingObjects

  if (isLoading) {
    return (
      <div className="page-container missions-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Memuat misi...</p>
        </div>
      </div>
    )
  }

  // Calculate top-level progress for the current level
  const completedCount = getCompletedChallengesForLevel(progress.completedChallenges, challenges)
  const totalCount = challenges.length

  return (
    <div className="page-container missions-page">
      <header className="page-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate('/home')}>
          <ChevronLeft size={18} /> Kembali
        </button>
      </header>

      <main className="missions-main stagger-children">
        <div className="missions-header glass-card">
          <h1 className="missions-title">
            <Flag className="title-icon" />
            Misi Matematika
          </h1>
          <p className="missions-desc">
            Selesaikan tantangan dari objek budaya Magetan untuk mengumpulkan XP.
          </p>

          <div className="missions-progress-summary">
            <div className="summary-stat">
              <span className="stat-label">XP Saat Ini</span>
              <span className="stat-value xp">{progress.totalXP}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Misi Selesai</span>
              <span className="stat-value">{completedCount} / {totalCount}</span>
            </div>
          </div>
        </div>

        <section className="missions-list">
          {challenges.length === 0 ? (
            <div className="empty-state glass-card">
              <p>Belum ada misi untuk jenjang {studentLevel}.</p>
            </div>
          ) : (
            challenges.map(challenge => {
              const module = modules.find(m => m.id === challenge.learningModuleId)
              const culturalObject = culturalObjects.find(c => c.id === module?.culturalObjectId)
              const isCompleted = progress.isChallengeCompleted(challenge.id)

              return (
                <MissionCard
                  key={challenge.id}
                  challenge={challenge}
                  moduleTopic={module?.topic || 'Topik'}
                  culturalObjectName={culturalObject?.name || 'Objek Budaya'}
                  isCompleted={isCompleted}
                />
              )
            })
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
