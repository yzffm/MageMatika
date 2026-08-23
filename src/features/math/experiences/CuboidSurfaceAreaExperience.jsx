import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { cuboidSurfaceArea, formatNumber } from '../../../domain/math/formulas'
import './CuboidSurfaceAreaExperience.css'

export default function CuboidSurfaceAreaExperience({ moduleData }) {
  const { dimensions, formula } = moduleData.mathematicalConcept
  const initialPanjang = dimensions.panjang || 30
  const initialLebar = dimensions.lebar || 20
  const initialTinggi = dimensions.tinggi || 15
  const unit = dimensions.unit || 'cm'
  
  const [panjang, setPanjang] = useState(initialPanjang)
  const [lebar, setLebar] = useState(initialLebar)
  const [tinggi, setTinggi] = useState(initialTinggi)
  
  // Surface area calculated via deterministic domain logic
  const surfaceArea = useMemo(() => cuboidSurfaceArea(panjang, lebar, tinggi), [panjang, lebar, tinggi])

  return (
    <div className="math-exp math-exp-cuboid">
      <div className="math-exp-visualization r3f-container">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 30, 50] }}>
          <Stage environment="city" intensity={0.5}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[panjang, tinggi, lebar]} />
              <meshStandardMaterial 
                color="#fda055" 
                roughness={0.6} 
                metalness={0.2}
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
          Bagaimana luas permukaan berubah jika salah satu sisi diperbesar?
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
          <span className="result-label">Rumus Luas Permukaan:</span>
          <span className="result-value formula"><code>{formula}</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Luas Permukaan Saat Ini:</span>
          <span className="result-value calculation">
             <strong>{formatNumber(surfaceArea, 2)} {unit}²</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
