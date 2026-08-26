import { useState } from 'react'
import { realDistance, formatNumber } from '../../../domain/math/formulas'

export default function MapScaleExperience({ moduleData }) {
  const { config } = moduleData.interactiveExperience || {}
  const scaleDenominator = config?.scaleDenominator || 100000 // 1 : 100.000
  
  const [mapDistance, setMapDistance] = useState(config?.initialDistance || 5) // cm

  // Calculate real distance (in cm, then convert to km)
  const realDistCm = realDistance(mapDistance, scaleDenominator)
  const realDistKm = realDistCm / 100000 // 100,000 cm in a km

  return (
    <div className="math-exp math-exp-scale">
      <div className="math-exp-visualization glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-primary-dark)', textAlign: 'center' }}>Peta & Jarak Sebenarnya</h3>
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '150px',
          backgroundColor: '#e6f2e6', // light green to simulate map
          border: '2px solid var(--color-border)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Simulate two points on a map moving further apart */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `calc(50% - ${mapDistance * 5}px)`,
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--color-danger)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.3s ease'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `calc(50% + ${mapDistance * 5}px)`,
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.3s ease'
          }}></div>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `calc(50% - ${mapDistance * 5}px)`,
            width: `${mapDistance * 10}px`,
            height: '2px',
            backgroundColor: 'var(--color-text)',
            borderTop: '2px dashed var(--color-text)',
            transform: 'translateY(-50%)',
            transition: 'all 0.3s ease'
          }}></div>
          
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            Skala 1 : {formatNumber(scaleDenominator, 0)}
          </div>
        </div>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          Ubah jarak pada peta untuk melihat pengaruhnya terhadap jarak sebenarnya.
        </p>

        <div className="math-exp-sliders">
          <div className="slider-group">
            <label>Jarak pada Peta: <strong>{mapDistance} cm</strong></label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.5"
              value={mapDistance} 
              onChange={e => setMapDistance(Number(e.target.value))} 
              className="slider" 
            />
          </div>
        </div>
      </div>

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus:</span>
          <span className="result-value formula"><code>Jarak Sebenarnya = Jarak Peta × Skala</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Jarak Sebenarnya:</span>
          <span className="result-value calculation">
             <strong>{formatNumber(realDistKm, 2)} km</strong>
             <br/>
             <small style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>({formatNumber(realDistCm, 0)} cm)</small>
          </span>
        </div>
      </div>
    </div>
  )
}
