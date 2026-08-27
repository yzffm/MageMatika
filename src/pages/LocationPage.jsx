import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Info, Camera, BookOpen, Clock, AlertTriangle, Calculator, Trophy } from 'lucide-react'
import { useCulturalObjects, useLearningModules } from '../hooks/useContent.js'
import { useStudentContext } from '../hooks/useStudentContext.js'
import { useChallenges } from '../hooks/useChallenges.js'
import { useToast } from '../hooks/useToast.jsx'
import BottomNav from '../components/BottomNav.jsx'
import './LocationPage.css'

export default function LocationPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const { culturalObjects, loading: loadingObj } = useCulturalObjects()
  const { studentLevel, isLoggedIn } = useStudentContext()
  
  const dest = culturalObjects.find(l => l.id === locationId)

  const { modules, loading: loadingMod } = useLearningModules({ 
    level: studentLevel, 
    culturalObjectId: locationId 
  })
  
  const activeModule = modules.length > 0 ? modules[0] : null

  const { challenges } = useChallenges({
    level: studentLevel,
    learningModuleId: activeModule ? activeModule.id : 'NONE'
  })
  const activeChallenge = challenges.length > 0 ? challenges[0] : null

  if (loadingObj || loadingMod) {
    return (
      <div className="page-container location-page">
        <div className="location-loading">
          <div className="loading-spinner" />
          <p>Memuat detail lokasi...</p>
        </div>
      </div>
    )
  }

  if (!dest) {
    return (
      <div className="page-container location-page">
        <header className="location-header animate-fade-in-up">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Kembali
          </button>
        </header>
        <div className="glass-card empty-state" style={{ marginTop: '2rem' }}>
          <p>Lokasi tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  const handleStartAR = () => {
    if (!isLoggedIn) {
      showToast('⚠️ Silakan isi identitas di halaman utama dulu.')
      setTimeout(() => navigate('/'), 2000)
      return
    }

    if (dest.ar && dest.ar.url) {
      window.location.href = dest.ar.url
    } else {
      showToast('⚠️ Pengalaman AR belum tersedia untuk lokasi ini.')
    }
  }

  return (
    <div className="page-container location-page">
      <header className="location-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate(`/kecamatan/${dest.kecamatanId}`)}>
          <ChevronLeft size={18} /> Kembali
        </button>
      </header>

      <main className="location-content stagger-children">
        {/* Hero Image - Cultural Context */}
        <div className="location-hero glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', borderRadius: '16px', marginBottom: '1rem', border: 'none' }}>
          <img 
            src={dest.image || '/images/default-culture.png'} 
            alt={dest.name} 
            style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
          />
          <div className="location-hero-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 60%, transparent 100%)' }}>
            <h1 className="location-title" style={{ color: 'white', margin: 0, fontSize: '1.75rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{dest.name}</h1>
            <p className="location-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '500' }}>{dest.kecamatanName}</p>
          </div>
        </div>

        {/* Sejarah & Info - Cultural Context */}
        <div className="location-info glass-card" style={{ marginBottom: '1rem' }}>
          <div className="info-section">
            <h3 className="info-title">
              <Clock size={16} /> Sejarah Singkat
            </h3>
            <p className="info-text">{dest.history}</p>
          </div>
        </div>

        {/* Interactive Math Button */}
        {activeModule?.interactiveExperience?.enabled && (
          <button 
            className="btn btn-secondary btn-large btn-math" 
            onClick={() => navigate(`/math/${activeModule.id}`)}
            style={{ marginBottom: '8px' }}
          >
            <Calculator size={20} />
            Eksplorasi Matematika
          </button>
        )}

        {/* Challenge Button */}
        {activeModule && activeChallenge && (
          <button 
            className="btn btn-large btn-challenge" 
            onClick={() => navigate(`/challenge/${activeChallenge.id}`, { state: { from: `/lokasi/${locationId}` } })}
            style={{ marginBottom: '8px' }}
          >
            <Trophy size={20} />
            Tantangan Matematika
          </button>
        )}

        {/* Action Button */}
        <button className="btn btn-primary btn-large btn-ar" onClick={handleStartAR} style={{ marginBottom: '1rem' }}>
          <Camera size={20} />
          Mulai Kamera AR
        </button>

        {/* Misi Matematika - Educational Content */}
        <div className="location-info glass-card">
          <div className="info-section">
            <h3 className="info-title">
              <BookOpen size={16} /> Misi Matematika ({studentLevel})
            </h3>
            
            {!activeModule ? (
              <div className="misi-box empty-module">
                <p>Materi untuk jenjang ini segera hadir.</p>
              </div>
            ) : (
              <div className="misi-box">
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>
                  {activeModule.title}
                </h4>
                <p>Di lokasi ini kamu akan mempelajari konsep <strong>{activeModule.topic}</strong>.</p>
                <p>Arahkan kamera ke <strong>{dest.name}</strong> untuk memunculkan representasi <code>{activeModule.mathematicalConcept?.shapeType}</code>.</p>
              </div>
            )}
          </div>

          {activeModule?.isPlaceholderData && (
            <div className="info-warning">
              <AlertTriangle size={14} />
              <p>Data pembelajaran ini masih berupa placeholder (dummy).</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
