import { useState, useEffect } from 'react'
import './SplashScreen.css'

export default function SplashScreen({ onFinish, subtitle = "Membuka Gerbang Magetan..." }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Start fade out after 2 seconds
    const timer1 = setTimeout(() => {
      setFadeOut(true)
    }, 2000)

    // Unmount and trigger callback after fade out completes
    const timer2 = setTimeout(() => {
      setVisible(false)
      if (onFinish) onFinish()
    }, 2800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onFinish])

  if (!visible) return null

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-logo-container">
        <span className="material-symbols-outlined splash-icon">explore</span>
        <h1 className="splash-title">MageMatika</h1>
      </div>
      <p className="splash-subtitle">{subtitle}</p>
      <div className="splash-loader">
        <div className="splash-loader-bar"></div>
      </div>
    </div>
  )
}
