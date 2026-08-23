import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Info, AlertTriangle } from 'lucide-react'
import './MathExperienceShell.css'

/**
 * Shell component for all math experiences.
 * Provides the shared layout, cultural context header, and 'Di Mana Letak Matematikanya?' framing.
 */
export default function MathExperienceShell({ culturalObject, moduleData, children }) {
  const navigate = useNavigate()

  if (!culturalObject || !moduleData) {
    return (
      <div className="math-shell-loading">
        <div className="loading-spinner" />
        <p>Memuat modul matematika...</p>
      </div>
    )
  }

  return (
    <div className="math-shell page-container animate-fade-in-up">
      <header className="math-shell-header">
        <button className="btn btn-ghost" onClick={() => navigate(`/lokasi/${culturalObject.id}`)}>
          <ChevronLeft size={18} /> Kembali
        </button>
      </header>

      <main className="math-shell-content stagger-children">
        {/* Cultural Context Header */}
        <div className="math-shell-banner glass-card">
          <div className="math-shell-badge">
            Eksplorasi Matematika {moduleData.level}
          </div>
          <h1 className="math-shell-title">{culturalObject.name}</h1>
          <p className="math-shell-subtitle">Materi: {moduleData.topic}</p>
        </div>

        {/* Framing Section */}
        <div className="math-shell-framing glass-card">
          <div className="info-section">
            <h3 className="info-title">
              <Info size={16} /> Di Mana Letak Matematikanya?
            </h3>
            <p className="info-text">
              Mari amati objek budaya <strong>{culturalObject.name}</strong>. Jika bentuknya disederhanakan, kita dapat memodelkannya sebagai bangun datar atau ruang matematika. 
              Di sini, kita akan mempelajari konsep <strong>{moduleData.topic}</strong>.
            </p>
          </div>
        </div>

        {moduleData.isPlaceholderData && (
          <div className="info-warning math-shell-warning">
            <AlertTriangle size={14} />
            <p>Ukuran pada eksplorasi ini masih berupa data sementara untuk pembelajaran.</p>
          </div>
        )}

        {/* Interactive Experience Payload */}
        <div className="math-shell-interactive">
          {children}
        </div>
      </main>
    </div>
  )
}
