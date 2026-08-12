import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="page-container animate-fade-in-up" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
      <AlertTriangle size={48} color="var(--color-warning)" />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Halaman tidak ditemukan.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Kembali ke Beranda</Link>
    </div>
  )
}
