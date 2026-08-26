import { useState } from 'react'
import { translate2D, scale2D } from '../../../domain/math/formulas'
import './Transformation2DExperience.css'

export default function Transformation2DExperience({ moduleData }) {
  const { config } = moduleData.interactiveExperience || {}
  const mode = config?.mode || 'translation'
  
  // Translation state
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  
  // Scaling state
  const [k, setK] = useState(1)

  // Base coordinates for a generic shape (e.g., a simple batik motif representation)
  // Let's use a simple polygon for demonstration: a kite or rhombus
  const baseShape = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 }
  ]

  // Calculate transformed shape based on mode
  const transformedShape = baseShape.map(pt => {
    let newPt = { ...pt }
    if (mode === 'scaling' || mode === 'both') {
      newPt = scale2D(newPt.x, newPt.y, k)
    }
    if (mode === 'translation' || mode === 'both') {
      newPt = translate2D(newPt.x, newPt.y, tx, ty)
    }
    return newPt
  })

  // SVG coordinate system mapping: 
  // Let's make the grid go from -10 to 10 in both axes.
  const GRID_SIZE = 10
  const SVG_SIZE = 300
  const center = SVG_SIZE / 2
  const scale = SVG_SIZE / (GRID_SIZE * 2) // pixels per unit

  // Helper to map math coords to SVG coords (SVG y goes down)
  const mapCoord = (pt) => `${center + pt.x * scale},${center - pt.y * scale}`

  const basePolygonPoints = baseShape.map(mapCoord).join(' ')
  const transformedPolygonPoints = transformedShape.map(mapCoord).join(' ')

  return (
    <div className="math-exp math-exp-2d">
      <div className="math-exp-visualization svg-container">
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="transform-svg">
          {/* Grid Lines */}
          <g className="grid-lines">
            {Array.from({ length: GRID_SIZE * 2 + 1 }).map((_, i) => {
              const pos = i * scale
              return (
                <g key={i}>
                  <line x1={pos} y1={0} x2={pos} y2={SVG_SIZE} className={i === GRID_SIZE ? 'axis' : 'grid-line'} />
                  <line x1={0} y1={pos} x2={SVG_SIZE} y2={pos} className={i === GRID_SIZE ? 'axis' : 'grid-line'} />
                </g>
              )
            })}
          </g>
          
          {/* Base Shape */}
          <polygon points={basePolygonPoints} className="base-shape" />
          
          {/* Transformed Shape */}
          <polygon points={transformedPolygonPoints} className="transformed-shape" />
          
          {/* Connection Lines (only for translation to show movement) */}
          {mode === 'translation' && baseShape.map((pt, i) => (
            <line 
              key={`conn-${i}`}
              x1={center + pt.x * scale} 
              y1={center - pt.y * scale} 
              x2={center + transformedShape[i].x * scale} 
              y2={center - transformedShape[i].y * scale}
              className="connection-line"
            />
          ))}
        </svg>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          {mode === 'translation' ? 'Geser motif batik menggunakan slider translasi.' : 'Ubah faktor skala motif batik.'}
        </p>

        <div className="math-exp-sliders">
          {(mode === 'translation' || mode === 'both') && (
            <>
              <div className="slider-group">
                <label>Translasi X: <strong>{tx}</strong></label>
                <input type="range" min="-8" max="8" value={tx} onChange={e => setTx(Number(e.target.value))} className="slider" />
              </div>
              <div className="slider-group">
                <label>Translasi Y: <strong>{ty}</strong></label>
                <input type="range" min="-8" max="8" value={ty} onChange={e => setTy(Number(e.target.value))} className="slider" />
              </div>
            </>
          )}

          {(mode === 'scaling' || mode === 'both') && (
            <div className="slider-group">
              <label>Faktor Skala (k): <strong>{k}x</strong></label>
              <input type="range" min="0.5" max="3" step="0.5" value={k} onChange={e => setK(Number(e.target.value))} className="slider" />
            </div>
          )}
        </div>
      </div>

      <div className="math-exp-results glass-card">
        <div className="result-row highlight">
          <span className="result-label">Status Motif:</span>
          <span className="result-value calculation">
             {mode === 'translation' && <strong>Bergeser sejauh ({tx}, {ty})</strong>}
             {mode === 'scaling' && <strong>{k === 1 ? 'Sama Besar' : k > 1 ? 'Diperbesar' : 'Diperkecil'}</strong>}
          </span>
        </div>
        <div className="result-row">
          <span className="result-label">Sifat Transformasi:</span>
          <span className="result-value formula">
            {mode === 'translation' ? 'Kekongruenan (Bentuk dan ukuran tetap sama)' : 'Kesebangunan (Bentuk sama, ukuran sebanding)'}
          </span>
        </div>
      </div>
    </div>
  )
}
