import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Info, MapPin } from 'lucide-react'
import { useStudentContext } from '../hooks/useStudentContext'
import { useChallenges } from '../hooks/useChallenges'
import { useCulturalObjects, useLearningModules } from '../hooks/useContent'
import ChallengeCard from '../features/challenge/components/ChallengeCard'
import './ChallengePage.css'

export default function ChallengePage() {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const { studentLevel } = useStudentContext()

  // 1. Fetch Challenge Data
  // Note: we fetch all and find, instead of filtering, so we can detect cross-level attempts
  const { challenges, loading: loadingChallenges } = useChallenges()
  const targetChallenge = challenges.find(c => c.id === challengeId)

  // 2. Fetch Module Data (based on challenge, if it exists)
  const targetModuleId = targetChallenge?.learningModuleId
  const { modules, loading: loadingModules } = useLearningModules()
  const targetModule = modules.find(m => m.id === targetModuleId)

  // 3. Fetch Cultural Object
  const targetCulturalObjectId = targetModule?.culturalObjectId
  const { culturalObjects, loading: loadingObjects } = useCulturalObjects()
  const targetCulturalObject = culturalObjects.find(obj => obj.id === targetCulturalObjectId)

  const isLoading = loadingChallenges || loadingModules || loadingObjects

  if (isLoading) {
    return (
      <div className="page-container challenge-page-layout">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Memuat tantangan...</p>
        </div>
      </div>
    )
  }

  // Cross-level security check
  if (!targetChallenge || targetChallenge.level !== studentLevel) {
    return (
      <div className="page-container challenge-page-layout">
        <header className="page-header animate-fade-in-up">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Kembali
          </button>
        </header>
        <div className="empty-state glass-card" style={{ marginTop: '2rem' }}>
          <p>Tantangan ini tidak tersedia untuk jenjang {studentLevel}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container challenge-page-layout">
      <header className="page-header animate-fade-in-up">
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate(`/math/${targetChallenge.learningModuleId}`)}
        >
          <ChevronLeft size={18} /> Kembali ke Eksplorasi
        </button>
      </header>

      <main className="challenge-main stagger-children">
        {/* Cultural Context Banner */}
        <div className="context-banner glass-card">
          <div className="context-header">
            <span className="module-topic">{targetModule?.topic}</span>
          </div>
          <h1 className="context-title">{targetModule?.title}</h1>
          <div className="context-location">
            <MapPin size={16} />
            {targetCulturalObject?.name}
          </div>
        </div>

        {/* The Challenge Itself */}
        <ChallengeCard challenge={targetChallenge} />
      </main>
    </div>
  )
}
