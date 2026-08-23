import { useState, useMemo } from 'react'
import { rectangleArea } from '../../../domain/math/formulas'
import './RectangleAreaExperience.css'

export default function RectangleAreaExperience({ moduleData }) {
  const { dimensions, formula } = moduleData.mathematicalConcept
  const initialPanjang = dimensions.panjang || 30
  const initialLebar = dimensions.lebar || 20
  const unit = dimensions.unit || 'cm'
  
  const [panjang, setPanjang] = useState(initialPanjang)
  const [lebar, setLebar] = useState(initialLebar)

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
          <rect 
            x={50 - drawWidth/2} 
            y={50 - drawHeight/2} 
            width={drawWidth} 
            height={drawHeight} 
            className="math-exp-shape"
          />
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

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus Luas:</span>
          <span className="result-value formula"><code>{formula}</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Luas Saat Ini:</span>
          <span className="result-value calculation">
            {panjang} × {lebar} = <strong>{area} {unit}²</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
