import { useState, useMemo } from 'react'
import { rectangleArea } from '../../../domain/math/formulas'
import './RectangleAreaExperience.css'

export default function RectangleAreaExperience({ moduleData }) {
  const { dimensions, formula } = moduleData.mathematicalConcept
  const initialPanjang = dimensions.panjang || 30
  const initialLebar = dimensions.lebar || 20
  const unit = dimensions.unit || 'cm'
  const culturalObjectId = moduleData.culturalObjectId || ''
  
  const [panjang, setPanjang] = useState(initialPanjang)
  const [lebar, setLebar] = useState(initialLebar)
  const [showEasterEgg, setShowEasterEgg] = useState(true)

  const isOriginalSize = panjang === initialPanjang && lebar === initialLebar

  const maxDimension = Math.max(initialPanjang, initialLebar) * 2
  
  // Calculate area
  const area = useMemo(() => rectangleArea(panjang, lebar), [panjang, lebar])
  
  // Calculate proportional SVG drawing dimensions
  // Max width/height of the container is roughly 100%, we'll use a viewBox 0 0 100 100
  const scale = 80 / Math.max(panjang, lebar)
  const drawWidth = panjang * scale
  const drawHeight = lebar * scale
  
  return (
    <div className="math-exp math-exp-rectangle">
      <div className="math-exp-visualization">
        <svg viewBox="0 0 100 100" className="math-exp-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="woven-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0,0 L10,10 M10,0 L0,10" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </pattern>
            <pattern id="bamboo-pattern" width="4" height="20" patternUnits="userSpaceOnUse">
              <rect width="4" height="20" fill="transparent" />
              <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            </pattern>
            <linearGradient id="rect-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary-dark)" />
            </linearGradient>
          </defs>
          <rect 
            x={50 - drawWidth/2} 
            y={50 - drawHeight/2} 
            width={drawWidth} 
            height={drawHeight} 
            className="math-exp-shape"
            fill={culturalObjectId.includes('pring') ? 'url(#bamboo-pattern)' : (culturalObjectId.includes('jali') || culturalObjectId.includes('tenun') ? 'url(#woven-pattern)' : 'url(#rect-gradient)')}
            style={{ 
              fill: 'url(#rect-gradient)', 
              transition: 'all 0.3s ease-out',
              stroke: 'white',
              strokeWidth: '2',
              rx: '4'
            }}
          />
          {/* Overlay pattern to combine gradient and pattern */}
          {(culturalObjectId.includes('pring') || culturalObjectId.includes('jali') || culturalObjectId.includes('tenun')) && (
            <rect 
              x={50 - drawWidth/2} 
              y={50 - drawHeight/2} 
              width={drawWidth} 
              height={drawHeight} 
              fill={culturalObjectId.includes('pring') ? 'url(#bamboo-pattern)' : 'url(#woven-pattern)'}
              style={{ transition: 'all 0.3s ease-out', rx: '4' }}
              pointerEvents="none"
            />
          )}
          {/* Dimension Labels */}
          <text x="50" y={50 - drawHeight/2 - 4} className="math-exp-label" textAnchor="middle">
            {panjang} {unit}
          </text>
          <text x={50 + drawWidth/2 + 4} y="50" className="math-exp-label" textAnchor="start" alignmentBaseline="middle">
            {lebar} {unit}
          </text>
        </svg>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          Bagaimana perubahan panjang sisi memengaruhi luas?
        </p>

        {isOriginalSize && showEasterEgg && (
          <div className="easter-egg-badge animate-fade-in-up" style={{
            background: 'var(--color-success)', color: 'white', padding: '6px 12px', 
            borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', 
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginBottom: '1rem', boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
            width: 'fit-content'
          }}>
            <span>✨ Tepat! Ini adalah ukuran aslinya!</span>
          </div>
        )}

        <div className="math-exp-sliders">
          <div className="slider-group">
            <label htmlFor="panjang-slider">
              Panjang: <strong>{panjang} {unit}</strong>
            </label>
            <input 
              id="panjang-slider"
              type="range" 
              min="5" 
              max={maxDimension} 
              value={panjang} 
              onChange={(e) => setPanjang(Number(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="slider-group">
            <label htmlFor="lebar-slider">
              Lebar: <strong>{lebar} {unit}</strong>
            </label>
            <input 
              id="lebar-slider"
              type="range" 
              min="5" 
              max={maxDimension} 
              value={lebar} 
              onChange={(e) => setLebar(Number(e.target.value))}
              className="slider"
            />
          </div>
        </div>
      </div>

      <div className="math-exp-results glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
        borderLeft: '4px solid var(--color-primary)',
        transform: 'translateY(0)',
        transition: 'transform 0.2s ease'
      }}>
        <div className="result-row">
          <span className="result-label">Rumus Luas:</span>
          <span className="result-value formula" style={{ background: 'var(--color-surface-hover)' }}><code>{formula}</code></span>
        </div>
        <div className="result-row highlight" style={{ marginTop: '12px' }}>
          <span className="result-label">Luas Saat Ini:</span>
          <span className="result-value calculation" style={{ 
            fontSize: '1.2rem', 
            textShadow: '0 0 10px rgba(27, 67, 50, 0.2)',
            transition: 'color 0.3s'
          }}>
            {panjang} × {lebar} = <strong style={{ color: 'var(--color-primary-container)', fontSize: '1.4rem' }}>{area} {unit}²</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
