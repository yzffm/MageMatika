import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { cuboidVolume, formatNumber } from '../../../domain/math/formulas'
import './CuboidSurfaceAreaExperience.css'

export default function CuboidVolumeExperience({ moduleData }) {
  const { dimensions, formula } = moduleData.mathematicalConcept
  const initialPanjang = dimensions.panjang || 30
  const initialLebar = dimensions.lebar || 20
  const initialTinggi = dimensions.tinggi || 15
  const unit = dimensions.unit || 'cm'
  
  const [panjang, setPanjang] = useState(initialPanjang)
  const [lebar, setLebar] = useState(initialLebar)
  const [tinggi, setTinggi] = useState(initialTinggi)
  
  // Volume calculated via deterministic domain logic
  const volume = useMemo(() => cuboidVolume(panjang, lebar, tinggi), [panjang, lebar, tinggi])

  return (
    <div className="math-exp math-exp-cuboid">
      <div className="math-exp-visualization r3f-container">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 30, 50] }}>
          <Stage environment="city" intensity={0.5}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[panjang, tinggi, lebar]} />
              <meshStandardMaterial 
                color="#b73a3a" 
                roughness={0.8} 
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
          Bagaimana volume berubah jika panjang, lebar, atau tinggi diubah?
        </p>

        <div className="math-exp-sliders">
          <div className="slider-group">
            <label htmlFor="panjang-slider">
              Panjang (p): <strong>{panjang} {unit}</strong>
            </label>
            <input 
              id="panjang-slider"
              type="range" 
              min="5" 
              max="60" 
              value={panjang} 
              onChange={(e) => setPanjang(Number(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="slider-group">
            <label htmlFor="lebar-slider">
              Lebar (l): <strong>{lebar} {unit}</strong>
            </label>
            <input 
              id="lebar-slider"
              type="range" 
              min="5" 
              max="60" 
              value={lebar} 
              onChange={(e) => setLebar(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-group">
            <label htmlFor="tinggi-slider">
              Tinggi (t): <strong>{tinggi} {unit}</strong>
            </label>
            <input 
              id="tinggi-slider"
              type="range" 
              min="5" 
              max="60" 
              value={tinggi} 
              onChange={(e) => setTinggi(Number(e.target.value))}
              className="slider"
            />
          </div>
        </div>
      </div>

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus Volume:</span>
          <span className="result-value formula"><code>{formula || 'V = p × l × t'}</code></span>
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
