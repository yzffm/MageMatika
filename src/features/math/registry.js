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
}
