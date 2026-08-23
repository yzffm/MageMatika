# MageMatika Content Traceability Map

This document tracks the traceability between cultural objects, educational modules, implemented interactive experiences, and the original source materials.

## Implementation Status

| Module ID | Cultural Object | Jenjang | Mathematical Concept | Interactive Experience | Challenge ID | Source Material Reference | Placeholder Status | Implementation Status |
|---|---|---|---|---|---|---|---|---|
| `tas-jali-jali-sd` | Tas Jali-Jali | SD | Luas Persegi Panjang | `rectangle-area` | `tas-jali-jali-sd-challenge-01` | `MATERI SD.md` (implied) | Placeholder | Implemented (VS3/VS4) |
| `pring-sedapur-sd` | Batik Pring Sedapur | SD | Luas Persegi Panjang | `rectangle-area` | `pring-sedapur-sd-challenge-01` | `MATERI SD.md` (implied) | Placeholder | Implemented (VS3/VS4) |
| `pragak-sd` | Batik Pragak | SD | Luas Segitiga | `triangle-area` | - | `MATERI SD.md` (implied) | Placeholder | Deferred (VS3/VS4) |
| `gerabah-nguri-sd` | Gerabah Nguri | SD | Volume Tabung | `cylinder-volume` | `gerabah-nguri-sd-challenge-01` | `MATERI SD.md` (lines 48-112) | Placeholder | Implemented (VS3/VS4) |
| `tas-jali-jali-smp` | Tas Jali-Jali | SMP | Luas Permukaan Balok | `cuboid-surface-area` | `tas-jali-jali-smp-challenge-01` | `Materi SMP.md` (lines 1-96) | Placeholder | Implemented (VS3/VS4) |

## Deferred Content

| Concept | Source Material Reference | Reason for Deferral |
|---|---|---|
| SMP Gerabah Nguri (Cylinder Volume & Proportions) | `Materi SMP.md` (lines 945-1069) | Awaiting content migration phase (VS3 focuses on existing modules only). |

*Note: All current dimensions are placeholder data and are used only for illustrative purposes to support the mathematical concepts.*

## Presentation Layer & Progress Tracing (VS5)

Vertical Slice 5 introduced the student-facing presentation of their progress. 

- **Missions Page (`/missions`)**: 
  - Reads level-filtered challenges.
  - Resolves learning modules based on `challenge.learningModuleId`.
  - Resolves cultural objects based on `learningModule.culturalObjectId`.
  - Uses `useProgress()` to reflect if a challenge is "Selesai" or "Mulai Tantangan".
- **Progress Page (`/progress`)**:
  - Reads session-based XP and completion state from `useProgress()`.
  - Calculates completion denominator only against the *current level's available challenges*.
  - Visualizes completed challenges by mapping their IDs back through the same `Challenge -> Module -> Cultural Object` hierarchy.
