import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { cylinderVolume, formatNumber } from '../../../domain/math/formulas'
import './CylinderVolumeExperience.css'

export default function CylinderVolumeExperience({ moduleData }) {
  const { dimensions, formula } = moduleData.mathematicalConcept
  const initialRadius = (dimensions.diameter || 14) / 2
  const initialHeight = dimensions.tinggi || 20
  const unit = dimensions.unit || 'cm'
  const culturalObjectId = moduleData.culturalObjectId || ''
  
  const [radius, setRadius] = useState(initialRadius)
  const [height, setHeight] = useState(initialHeight)
  const [showEasterEgg, setShowEasterEgg] = useState(true)

  const isOriginalSize = radius === initialRadius && height === initialHeight

  // Dynamic material based on cultural object
  const getMaterialProps = () => {
    if (culturalObjectId.includes('gerabah')) {
      return { color: '#c17a58', roughness: 0.9, metalness: 0.1 } // Terracotta clay
    }
    if (culturalObjectId.includes('gamelan')) {
      return { color: '#d4af37', roughness: 0.2, metalness: 0.9 } // Bronze / Gold
    }
    return { color: '#86af99', roughness: 0.7, metalness: 0.1 }
  }
  const matProps = getMaterialProps()
  
  // Volume calculated via deterministic domain logic, not R3F
  const volume = useMemo(() => cylinderVolume(radius, height), [radius, height])

  return (
    <div className="math-exp math-exp-cylinder">
      <div className="math-exp-visualization r3f-container">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 20, 40] }}>
          <Stage environment="city" intensity={0.5}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[radius, radius, height, 32]} />
              <meshStandardMaterial 
                color={matProps.color} 
                roughness={matProps.roughness} 
                metalness={matProps.metalness}
              />
            </mesh>
          </Stage>
          <OrbitControls makeDefault minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} enableZoom={true} />
        </Canvas>
        <div className="r3f-hint">
          <span className="material-symbols-outlined">touch_app</span>
          Geser untuk memutar
        </div>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          Apa yang terjadi jika tinggi diperbesar?
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
            <label htmlFor="radius-slider">
              Jari-jari (r): <strong>{radius} {unit}</strong>
            </label>
            <input 
              id="radius-slider"
              type="range" 
              min="2" 
              max="20" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="slider-group">
            <label htmlFor="height-slider">
              Tinggi (t): <strong>{height} {unit}</strong>
            </label>
            <input 
              id="height-slider"
              type="range" 
              min="5" 
              max="50" 
              value={height} 
              onChange={(e) => setHeight(Number(e.target.value))}
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
          <span className="result-label">Rumus Volume:</span>
          <span className="result-value formula" style={{ background: 'var(--color-surface-hover)' }}><code>{formula}</code></span>
        </div>
        <div className="result-row highlight" style={{ marginTop: '12px' }}>
          <span className="result-label">Volume Saat Ini:</span>
          <span className="result-value calculation" style={{ 
            fontSize: '1.2rem', 
            textShadow: '0 0 10px rgba(27, 67, 50, 0.2)',
            transition: 'color 0.3s'
          }}>
             <strong style={{ color: 'var(--color-primary-container)', fontSize: '1.4rem' }}>{formatNumber(volume, 2)} {unit}³</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
