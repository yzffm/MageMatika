import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function KecamatanPage() {
  const { kecamatanId } = useParams()

  return (
    <div className="page-container animate-fade-in-up" style={{ gap: '1rem' }}>
      <Link to="/peta" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        <ChevronLeft size={18} /> Kembali ke Peta
      </Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>
        Kecamatan: {kecamatanId}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Daftar destinasi ethnomathematics di kecamatan ini akan ditampilkan di sini.
      </p>
    </div>
  )
}
