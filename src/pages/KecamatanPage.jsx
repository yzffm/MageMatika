import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, BookOpen, GraduationCap } from 'lucide-react'
import { useCulturalObjects } from '../hooks/useContent.js'
import BottomNav from '../components/BottomNav.jsx'
import './KecamatanPage.css'

export default function KecamatanPage() {
  const { kecamatanId } = useParams()
  const navigate = useNavigate()
  const { culturalObjects, loading } = useCulturalObjects()

  if (loading) {
    return (
      <div className="page-container kecamatan-page">
        <div className="kecamatan-loading">
          <div className="loading-spinner" />
          <p>Memuat destinasi...</p>
        </div>
      </div>
    )
  }

  const destinasiList = culturalObjects.filter(l => l.kecamatanId === kecamatanId)
  // Kalau destinasi ada, ambil nama dari data, kalau tidak capitalize ID-nya
  const kecamatanName = destinasiList.length > 0 
    ? destinasiList[0].kecamatanName 
    : kecamatanId.charAt(0).toUpperCase() + kecamatanId.slice(1)

  return (
    <div className="page-container kecamatan-page">
      <header className="kecamatan-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate('/peta')}>
          <ChevronLeft size={18} /> Peta
        </button>
        <div>
          <h1 className="kecamatan-title">Kecamatan {kecamatanName}</h1>
          <p className="kecamatan-subtitle">Pilih destinasi ethnomathematics</p>
        </div>
      </header>

      <main className="destinasi-list animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {destinasiList.length === 0 ? (
          <div className="glass-card empty-state">
            <p>Belum ada destinasi aktif di kecamatan ini.</p>
          </div>
        ) : (
          destinasiList.map(dest => (
            <div 
              key={dest.id} 
              className="destinasi-card glass-card"
              onClick={() => navigate(`/lokasi/${dest.id}`)}
            >
              <h2 className="destinasi-name">{dest.name}</h2>
              <p className="destinasi-desc">{dest.shortDescription}</p>
              
              <div className="destinasi-action">
                <span className="btn-text">Lihat Detail →</span>
              </div>
            </div>
          ))
        )}
      </main>
      <BottomNav />
    </div>
  )
}
