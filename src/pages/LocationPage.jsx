import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function LocationPage() {
  const { locationId } = useParams()

  return (
    <div className="page-container animate-fade-in-up" style={{ gap: '1rem' }}>
      <Link to="/peta" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        <ChevronLeft size={18} /> Kembali
      </Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>
        Lokasi: {locationId}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Detail lokasi dan tombol masuk AR akan ditampilkan di sini.
      </p>
    </div>
  )
}
