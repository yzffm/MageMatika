import { lazy } from 'react'

/**
 * Registry of interactive math experiences.
 * Uses React.lazy to code-split the heavy R3F/Three.js experiences
 * so they are only loaded when a student actually visits an exploration page.
 */
export const experienceRegistry = {
  'rectangle-area': lazy(() => import('./experiences/RectangleAreaExperience')),
  'cylinder-volume': lazy(() => import('./experiences/CylinderVolumeExperience')),
  'cuboid-surface-area': lazy(() => import('./experiences/CuboidSurfaceAreaExperience')),
  'cuboid-volume': lazy(() => import('./experiences/CuboidVolumeExperience')),
  'transformation-2d': lazy(() => import('./experiences/Transformation2DExperience')),
  'arithmetic-sequence': lazy(() => import('./experiences/ArithmeticSequenceExperience')),
  'statistics-average': lazy(() => import('./experiences/StatisticsAverageExperience')),
  'map-scale': lazy(() => import('./experiences/MapScaleExperience')),
}
