import { useNavigate } from 'react-router-dom'
import { MapPin, Compass, Sparkles } from 'lucide-react'
import FormSiswa from '../components/FormSiswa.jsx'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()

  const handleFormSubmit = () => {
    navigate('/peta')
  }

  return (
    <div className="home-page">
      {/* Background decorative elements */}
      <div className="home-bg-orb home-bg-orb--1" />
      <div className="home-bg-orb home-bg-orb--2" />
      <div className="home-bg-orb home-bg-orb--3" />

      <div className="page-container home-content">
        {/* Hero Section */}
        <header className="home-hero animate-fade-in-up">
          <div className="home-icon-badge">
            <Sparkles size={28} />
          </div>
          <h1 className="home-title">
            Mage<span className="home-title-accent">Matika</span>
          </h1>
          <p className="home-subtitle">
            Jelajahi Matematika melalui Kearifan Lokal Kabupaten Magetan
            dengan teknologi <strong>Augmented Reality</strong>
          </p>
        </header>

        {/* Features */}
        <div className="home-features stagger-children">
          <div className="home-feature glass-card">
            <div className="home-feature-icon">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="home-feature-title">Peta Interaktif</h3>
              <p className="home-feature-desc">Jelajahi 18 kecamatan Magetan</p>
            </div>
          </div>
          <div className="home-feature glass-card">
            <div className="home-feature-icon home-feature-icon--warm">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="home-feature-title">AR Ethnomathematics</h3>
              <p className="home-feature-desc">Scan objek untuk belajar geometri</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="home-form-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <FormSiswa onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  )
}
