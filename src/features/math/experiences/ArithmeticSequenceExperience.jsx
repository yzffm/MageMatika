import { useState } from 'react'
import { arithmeticNthTerm } from '../../../domain/math/formulas'

export default function ArithmeticSequenceExperience({ moduleData }) {
  const { config } = moduleData.interactiveExperience || {}
  const initialA = config?.a || 1
  const initialB = config?.b || 2
  
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)
  const [n, setN] = useState(5)

  // Calculate sequence up to n
  const sequence = Array.from({ length: n }).map((_, i) => arithmeticNthTerm(a, b, i + 1))
  const nthTerm = sequence[sequence.length - 1]

  return (
    <div className="math-exp math-exp-sequence">
      <div className="math-exp-visualization glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Visualisasi Barisan</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {sequence.map((term, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: i === n - 1 ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                color: i === n - 1 ? 'white' : 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {term}
              </div>
              <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>U{i + 1}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          Atur nilai awal (a) dan selisih (b) untuk melihat perubahan barisan.
        </p>

        <div className="math-exp-sliders">
          <div className="slider-group">
            <label>Suku Awal (a): <strong>{a}</strong></label>
            <input type="range" min="1" max="20" value={a} onChange={e => setA(Number(e.target.value))} className="slider" />
          </div>
          
          <div className="slider-group">
            <label>Beda/Selisih (b): <strong>{b}</strong></label>
            <input type="range" min="1" max="20" value={b} onChange={e => setB(Number(e.target.value))} className="slider" />
          </div>

          <div className="slider-group">
            <label>Cari Suku ke-n: <strong>{n}</strong></label>
            <input type="range" min="1" max="20" value={n} onChange={e => setN(Number(e.target.value))} className="slider" />
          </div>
        </div>
      </div>

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus Suku ke-n:</span>
          <span className="result-value formula"><code>Un = a + (n - 1)b</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Nilai Suku ke-{n} (U{n}):</span>
          <span className="result-value calculation">
             <strong>{nthTerm}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
