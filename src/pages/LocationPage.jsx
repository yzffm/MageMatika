import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Info, Camera, BookOpen, Clock, AlertTriangle } from 'lucide-react'
import { useLocations } from '../hooks/useLocations'
import { useToast } from '../hooks/useToast.jsx'
import './LocationPage.css'

export default function LocationPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const { locations, loading } = useLocations()
  const { showToast } = useToast()

  if (loading) {
    return (
      <div className="page-container location-page">
        <div className="location-loading">
          <div className="loading-spinner" />
          <p>Memuat detail lokasi...</p>
        </div>
      </div>
    )
  }

  const dest = locations.find(l => l.id === locationId)

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
    // Pastikan user sudah login (isi form siswa)
    const studentName = sessionStorage.getItem('studentName')
    if (!studentName) {
      showToast('⚠️ Silakan isi identitas di halaman utama dulu.')
      setTimeout(() => navigate('/'), 2000)
      return
    }

    // Navigasi full page ke HTML statis AR (bukan via React Router)
    window.location.href = dest.arCheckpointUrl
  }

  return (
    <div className="page-container location-page">
      <header className="location-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate(`/kecamatan/${dest.kecamatanId}`)}>
          <ChevronLeft size={18} /> Kembali
        </button>
      </header>

      <main className="location-content stagger-children">
        {/* Banner */}
        <div className="location-banner glass-card">
          <div className="location-badges">
            <span className="badge badge-primary">{dest.materiMatematika}</span>
            <span className="badge badge-secondary">{dest.jenjang}</span>
          </div>
          <h1 className="location-title">{dest.name}</h1>
          <p className="location-subtitle">{dest.kecamatanName}</p>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary btn-large btn-ar" onClick={handleStartAR}>
          <Camera size={20} />
          Mulai Kamera AR
        </button>

        {/* Sejarah & Info */}
        <div className="location-info glass-card">
          <div className="info-section">
            <h3 className="info-title">
              <Clock size={16} /> Sejarah Singkat
            </h3>
            <p className="info-text">{dest.history}</p>
          </div>
          
          <div className="info-section">
            <h3 className="info-title">
              <BookOpen size={16} /> Misi Matematika
            </h3>
            <div className="misi-box">
              <p>Di lokasi ini kamu akan mempelajari konsep <strong>{dest.materiMatematika}</strong>.</p>
              <p>Arahkan kamera ke <strong>{dest.name}</strong> untuk memunculkan bentuk <code>{dest.shapeType}</code>.</p>
            </div>
          </div>

          {dest.isPlaceholderData && (
            <div className="info-warning">
              <AlertTriangle size={14} />
              <p>Data masih berupa placeholder (dummy).</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
