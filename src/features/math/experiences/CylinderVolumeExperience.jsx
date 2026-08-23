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
  
  const [radius, setRadius] = useState(initialRadius)
  const [height, setHeight] = useState(initialHeight)
  
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
                color="#86af99" 
                roughness={0.7} 
                metalness={0.1}
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

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus Volume:</span>
          <span className="result-value formula"><code>{formula}</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Volume Saat Ini:</span>
          <span className="result-value calculation">
             <strong>{formatNumber(volume, 2)} {unit}³</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
