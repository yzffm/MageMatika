import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Use path prefixes to determine active state
  // e.g. /kecamatan/1 should keep the Explore tab active
  const path = location.pathname
  const isHome = path === '/home'
  const isExplore = path === '/peta' || path.startsWith('/kecamatan') || path.startsWith('/lokasi')
  const isMissions = path.startsWith('/missions')
  const isProgress = path.startsWith('/progress')

  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${isHome ? 'bottom-nav-item--active' : ''}`} 
        onClick={() => navigate('/home')}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="bottom-nav-label">Home</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${isExplore ? 'bottom-nav-item--active' : ''}`} 
        onClick={() => navigate('/peta')}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}>explore</span>
        <span className="bottom-nav-label">Explore</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${isMissions ? 'bottom-nav-item--active' : ''}`} 
        onClick={() => navigate('/missions')}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isMissions ? "'FILL' 1" : "'FILL' 0" }}>task_alt</span>
        <span className="bottom-nav-label">Missions</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${isProgress ? 'bottom-nav-item--active' : ''}`} 
        onClick={() => navigate('/progress')}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isProgress ? "'FILL' 1" : "'FILL' 0" }}>trending_up</span>
        <span className="bottom-nav-label">Progress</span>
      </button>
    </nav>
  )
}
