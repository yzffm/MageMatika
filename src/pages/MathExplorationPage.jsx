import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCulturalObjects, useLearningModules } from '../hooks/useContent.js'
import { useStudentContext } from '../hooks/useStudentContext.js'
import MathExperienceShell from '../features/math/components/MathExperienceShell.jsx'
import MathExperienceRenderer from '../features/math/components/MathExperienceRenderer.jsx'
import './MathExplorationPage.css'

export default function MathExplorationPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  
  const { culturalObjects, loading: loadingObj } = useCulturalObjects()
  const { studentLevel } = useStudentContext()
  
  // We fetch all modules to find the specific one by ID
  const { modules, loading: loadingMod } = useLearningModules()
  
  if (loadingObj || loadingMod) {
    return (
      <div className="page-container math-exploration-page">
        <div className="math-loading">
          <div className="loading-spinner" />
          <p>Memuat eksplorasi matematika...</p>
        </div>
      </div>
    )
  }

  const moduleData = modules.find(m => m.id === moduleId)
  
  if (!moduleData) {
    return (
      <div className="page-container math-exploration-page">
        <header className="math-header animate-fade-in-up">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Kembali
          </button>
        </header>
        <div className="glass-card empty-state" style={{ marginTop: '2rem' }}>
          <p>Modul matematika tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  // Level validation - student can only access modules for their current level
  if (moduleData.level !== studentLevel) {
    return (
      <div className="page-container math-exploration-page">
        <header className="math-header animate-fade-in-up">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Kembali
          </button>
        </header>
        <div className="glass-card empty-state" style={{ marginTop: '2rem' }}>
          <p>Modul ini bukan untuk jenjang {studentLevel}.</p>
        </div>
      </div>
    )
  }

  const culturalObject = culturalObjects.find(c => c.id === moduleData.culturalObjectId)

  return (
    <MathExperienceShell culturalObject={culturalObject} moduleData={moduleData}>
      <MathExperienceRenderer moduleData={moduleData} />
    </MathExperienceShell>
  )
}
