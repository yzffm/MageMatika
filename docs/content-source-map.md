# MageMatika Content Traceability Map

This document tracks the traceability between cultural objects, educational modules, implemented interactive experiences, and the original source materials.

## Implementation Status (SMP Final Content Integration - VS7)

| Module ID | Cultural Object | Jenjang | Mathematical Concept | Interactive Experience | Challenge ID | Source Material Reference | Placeholder Status | Implementation Status |
|---|---|---|---|---|---|---|---|---|
| `tas-jali-jali-sd` | Tas Jali-Jali | SD | Luas Persegi Panjang | `rectangle-area` | `tas-jali-jali-sd-challenge-01` | `MATERI SD.md` | Placeholder | Implemented (VS3/VS4) |
| `pring-sedapur-sd` | Batik Pring Sedapur | SD | Luas Persegi Panjang | `rectangle-area` | `pring-sedapur-sd-challenge-01` | `MATERI SD.md` | Placeholder | Implemented (VS3/VS4) |
| `pragak-sd` | Batik Parang Selo (Pragak) | SD | Luas Segitiga | `triangle-area` | - | `MATERI SD.md` | Placeholder | Deferred (VS3/VS4) |
| `gerabah-nguri-sd` | Gerabah Nguri | SD | Volume Tabung | `cylinder-volume` | `gerabah-nguri-sd-challenge-01` | `MATERI SD.md` | Placeholder | Implemented (VS3/VS4) |
| `sentra-genteng-bata-smp` | Sentra Genteng dan Batu Bata | SMP | Volume Balok | `cuboid-volume` (Disabled) | `sentra-genteng-bata-smp-ch` | `Materi SMP Final.pdf` (Barat) | Final | Content Implemented |
| `batik-tanjung-smp` | Batik Tanjung | SMP | Translasi | `none` | `batik-tanjung-smp-ch` | `Materi SMP Final.pdf` (Bendo) | Final | Content Implemented |
| `kerajinan-gamelan-smp` | Kerajinan Gamelan | SMP | Luas Lingkaran & Vol Tabung | `cylinder-volume` | `kerajinan-gamelan-smp-ch` | `Materi SMP Final.pdf` (Karangrejo)| Final | Fully Implemented |
| `karawitan-karas-smp` | Karawitan Karas Ngesti Budoyo | SMP | Barisan Aritmetika | `none` | `karawitan-karas-smp-ch` | `Materi SMP Final.pdf` (Karas) | Final | Content Implemented |
| `batik-sukowijoyo-smp` | Batik Sukowijoyo | SMP | Transformasi & Kekongruenan | `none` | `batik-sukowijoyo-smp-ch` | `Materi SMP Final.pdf` (Kartoharjo)| Final | Content Implemented |
| `batik-kepo-smp` | Batik KEPO | SMP | Transformasi Geometri | `none` | `batik-kepo-smp-ch` | `Materi SMP Final.pdf` (Kawedanan) | Final | Content Implemented |
| `gerabah-nguri-smp` | Gerabah Desa Nguri | SMP | Volume Tabung | `cylinder-volume` | `gerabah-nguri-smp-ch` | `Materi SMP Final.pdf` (Lembeyan) | Final | Fully Implemented |
| `kerajinan-kulit-magetan-smp` | Sentra Kerajinan Kulit | SMP | Luas Persegi Panjang | `rectangle-area` | `kerajinan-kulit-magetan-smp-ch` | `Materi SMP Final.pdf` (Magetan) | Final | Fully Implemented |
| `sendang-kamal-smp` | Manusuk Sima Sendang Kamal | SMP | Skala & Perbandingan | `none` | `sendang-kamal-smp-ch` | `Materi SMP Final.pdf` (Maospati) | Final | Content Implemented |
| `kerajinan-kulit-ngariboyo-smp` | Sentra Kerajinan Kulit Ngariboyo | SMP | Kesebangunan | `none` | `kerajinan-kulit-ngariboyo-smp-ch` | `Materi SMP Final.pdf` (Ngariboyo) | Final | Content Implemented |
| `batik-udar-welingan-smp` | Batik Udar Welingan | SMP | Transformasi Geometri | `none` | `batik-udar-welingan-smp-ch` | `Materi SMP Final.pdf` (Nguntoronadi)| Final | Content Implemented |
| `batik-pari-memping-smp` | Batik Tulis Pari Memping Kuning | SMP | Kekongruenan | `none` | `batik-pari-memping-smp-ch` | `Materi SMP Final.pdf` (Panekan) | Final | Content Implemented |
| `batik-parang-selo-smp` | Batik Parang Selo | SMP | Kesebangunan | `none` | `batik-parang-selo-smp-ch` | `Materi SMP Final.pdf` (Parang) | Final | Content Implemented |
| `pring-sedapur-smp` | Batik Pring Sedapur | SMP | Transformasi Geometri | `none` | `pring-sedapur-smp-ch` | `Materi SMP Final.pdf` (Plaosan) | Final | Content Implemented |
| `tenun-cileng-smp` | Tenun Tradisional Desa Cileng | SMP | Luas Persegi Panjang | `rectangle-area` | `tenun-cileng-smp-ch` | `Materi SMP Final.pdf` (Poncol) | Final | Fully Implemented |
| `batik-sekar-lawu-smp` | Batik Sekar Lawu | SMP | Translasi | `none` | `batik-sekar-lawu-smp-ch` | `Materi SMP Final.pdf` (Sidorejo) | Final | Content Implemented |
| `jeruk-pamelo-smp` | Jeruk Pamelo | SMP | Statistika & Perbandingan | `none` | `jeruk-pamelo-smp-ch` | `Materi SMP Final.pdf` (Sukomoro) | Final | Content Implemented |

*Note: The old provisional `tas-jali-jali-smp` module has been removed because it was superseded by the final curriculum.*

## Presentation Layer & Progress Tracing (VS5)

Vertical Slice 5 introduced the student-facing presentation of their progress. 

- **Missions Page (`/missions`)**: 
  - Reads level-filtered challenges.
  - Resolves learning modules based on `challenge.learningModuleId`.
  - Resolves cultural objects based on `learningModule.culturalObjectId`.
  - Uses `useProgress()` to reflect if a challenge is "Selesai" atau "Mulai Tantangan".
- **Progress Page (`/progress`)**:
  - Reads session-based XP and completion state from `useProgress()`.
  - Calculates completion denominator only against the *current level's available challenges*.
  - Visualizes completed challenges by mapping their IDs back through the same `Challenge -> Module -> Cultural Object` hierarchy.

## Persistence & State Tracing (VS6)

Vertical Slice 6 layered non-blocking persistence onto the Progress model:

- **Local-First Authority (`sessionStorage`)**:
  - `magematika_progress` remains the primary source of truth, avoiding duplicate XP logic and shielding the student from network failures.
- **Optimistic Synchronization**:
  - Pushes challenge completions to Supabase asynchronously using an idempotent `upsert` mechanism (checking `student_name`, `student_class`, `challenge_id`).
- **Data Completeness limitation**:
  - Persistent state in the proposed Supabase schema is bound to application identity (`studentName` + `studentClass`), *not* a secure authenticated identity, satisfying the VS6 audit requirement without breaking the current user session model.
