import { Suspense } from 'react'
import { experienceRegistry } from '../registry'

/**
 * Renderer that dynamically loads and displays the appropriate math experience
 * based on the interactiveExperience.type defined in the learning module.
 */
export default function MathExperienceRenderer({ moduleData }) {
  const interactiveConfig = moduleData?.interactiveExperience

  if (!interactiveConfig) {
    return (
      <div className="math-exp-error glass-card">
        <p>Konfigurasi eksplorasi matematika tidak ditemukan untuk modul ini.</p>
      </div>
    )
  }

  if (!interactiveConfig.enabled) {
    return (
      <div className="math-exp-error glass-card">
        <p>Eksplorasi matematika untuk konsep ini belum tersedia (segera hadir).</p>
      </div>
    )
  }

  const ExperienceComponent = experienceRegistry[interactiveConfig.type]

  if (!ExperienceComponent) {
    return (
      <div className="math-exp-error glass-card">
        <p>Tipe eksplorasi <code>{interactiveConfig.type}</code> tidak didukung.</p>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="math-shell-loading">
        <div className="loading-spinner" />
        <p>Memuat visualisasi interaktif...</p>
      </div>
    }>
      <ExperienceComponent moduleData={moduleData} />
    </Suspense>
  )
}
