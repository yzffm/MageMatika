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
        {/* Cultural Context Hero Image */}
        <div className="math-shell-hero glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', borderRadius: '16px', marginBottom: '1rem', border: 'none' }}>
          <img 
            src={culturalObject.image || '/images/default-culture.png'} 
            alt={culturalObject.name} 
            style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
          />
          <div className="math-shell-hero-overlay" style={{ position: 'absolute', inset: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 70%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div className="math-shell-badge" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem', background: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              Eksplorasi Matematika {moduleData.level}
            </div>
            <h1 className="math-shell-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{culturalObject.name}</h1>
            <p className="math-shell-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Materi: {moduleData.topic}</p>
          </div>
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
