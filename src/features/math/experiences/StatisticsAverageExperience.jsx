import { useState } from 'react'
import { calculateMean, formatNumber } from '../../../domain/math/formulas'

export default function StatisticsAverageExperience({ moduleData }) {
  const { config } = moduleData.interactiveExperience || {}
  const initialData = config?.initialData || [10, 15, 20]
  
  const [data, setData] = useState(initialData)

  const mean = calculateMean(data)

  const handlePointChange = (index, newValue) => {
    const newData = [...data]
    newData[index] = newValue
    setData(newData)
  }

  const handleAddPoint = () => {
    if (data.length < 8) {
      setData([...data, mean > 0 ? Math.round(mean) : 10])
    }
  }

  const handleRemovePoint = (index) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="math-exp math-exp-stats">
      <div className="math-exp-visualization glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ color: 'var(--color-primary-dark)', textAlign: 'center' }}>Sebaran Data & Rata-rata</h3>
        <div style={{ position: 'relative', height: '150px', borderBottom: '2px solid var(--color-border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: '20px' }}>
          {/* Average Line */}
          <div style={{
            position: 'absolute',
            bottom: `${mean * 2}px`, // Simple scaling
            left: 0,
            right: 0,
            borderTop: '2px dashed var(--color-secondary)',
            transition: 'bottom 0.3s ease'
          }}>
            <span style={{ position: 'absolute', right: '0', top: '-20px', fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
              Mean: {formatNumber(mean, 1)}
            </span>
          </div>

          {/* Bar Charts */}
          {data.map((val, i) => (
            <div key={i} style={{
              width: '30px',
              height: `${val * 2}px`, // Simple scaling
              backgroundColor: 'var(--color-primary)',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s ease',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '0.8rem', marginBottom: '5px' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="math-exp-controls">
        <p className="math-exp-prompt">
          <span className="material-symbols-outlined">lightbulb</span>
          Ubah nilai setiap data untuk melihat bagaimana rata-rata (mean) berubah.
        </p>

        <div className="math-exp-sliders" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {data.map((val, i) => (
            <div className="slider-group" key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Data {i + 1}: <strong>{val}</strong></label>
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  value={val} 
                  onChange={e => handlePointChange(i, Number(e.target.value))} 
                  className="slider" 
                />
              </div>
              <button 
                className="btn btn-icon" 
                onClick={() => handleRemovePoint(i)}
                disabled={data.length <= 1}
                title="Hapus Data"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--color-danger)' }}>delete</span>
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={handleAddPoint} disabled={data.length >= 8} style={{ marginTop: '1rem', width: '100%' }}>
          + Tambah Data
        </button>
      </div>

      <div className="math-exp-results glass-card">
        <div className="result-row">
          <span className="result-label">Rumus Rata-rata:</span>
          <span className="result-value formula"><code>Mean = Jumlah Data / Banyak Data</code></span>
        </div>
        <div className="result-row highlight">
          <span className="result-label">Rata-rata (Mean):</span>
          <span className="result-value calculation">
             <strong>{formatNumber(mean, 2)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
