# AGENTS.md — MageMatika Engineering Constitution

> This file is the primary engineering and product instruction for AI coding agents working on MageMatika in Antigravity IDE.
> Read this file before making architectural, UI, data, or dependency changes.
>
> **Project:** MageMatika
> **Domain:** Ethnomathematics education using Magetan cultural context
> **Primary target:** SD and SMP
> **Future target:** SMA, only when content and time allow
> **Deadline constraint:** 28 August 2026
> **Current date context:** August 2026

---

## 0. NON-NEGOTIABLE RULES

1. **Inspect the existing code before changing it.** Do not assume the repository matches a generic React/Vite starter.
2. **Do not rewrite the application from scratch.** Extend/refactor the current codebase incrementally.
3. **Preserve working features unless the task explicitly replaces them.** In particular, do not accidentally remove the existing Magetan map, cultural-location data, or legacy AR path while introducing the new architecture.
4. **Do not invent cultural facts, historical claims, curriculum topics, formulas, or learning objectives.** If source material is missing or ambiguous, use a clearly marked placeholder and flag it.
5. **Current SD/SMP/SMA content is provisional.** Use the material currently available in the repository/project as seed content only. Final curriculum and cultural content will be supplied later by the team and must be treated as the new source of truth when supplied.
6. **Do not block the core learning experience behind physical location, GPS, QR, camera, or AR.** Real-world AR/location experiences are enrichment only.
7. **AR and Interactive Mathematics have different responsibilities:**
   - AR = cultural immersion.
   - Interactive geometry/math = mathematical exploration.
8. **Do not force every lesson into 3D.** Use 2D interaction for 2D concepts and R3F/Three.js for concepts that genuinely benefit from spatial manipulation.
9. **Do not create custom 3D cultural models unless explicitly requested.** Prefer reusable mathematical primitives.
10. **Do not add complex authentication.** Student onboarding is intentionally lightweight: name + jenjang + kelas. Supabase persistence can be added without introducing email/password authentication unless explicitly requested.
11. **Do not fabricate SMA content.** SMA may exist as a future-ready state/placeholder only until final content is supplied.
12. **Do not introduce large unrelated dependencies or architecture changes without justification.** Deadline and agent reliability matter more than theoretical completeness.
13. **After meaningful changes, run lint/build and fix regressions before declaring the task complete.**
14. **Keep the UI responsive and mobile-first**, especially AR and interactive mathematics.
15. **When requirements conflict, this file and explicit user instructions take priority over assumptions.**

---

# 1. PRODUCT VISION

MageMatika is not simply a quiz app containing cultural pictures.

The intended learning experience is:

```text
CULTURE
  ↓
OBSERVE
  ↓
CULTURAL STORY
  ↓
FIND THE MATHEMATICS
  ↓
MATHEMATICAL ABSTRACTION
  ↓
INTERACTIVE EXPLORATION
  ↓
DISCOVERY
  ↓
CHALLENGE
  ↓
REWARD
  ↓
PROGRESS
```

The ethnomathematics relationship must remain explicit:

> **Culture gives context. Mathematics explains patterns, shapes, measurements, and relationships. Interaction lets students discover those relationships.**

---

# 2. FINAL UX / INFORMATION ARCHITECTURE

The approved conceptual architecture is:

```text
LANDING
  ↓
STUDENT ONBOARDING
  ├── Nama Lengkap
  ├── Jenjang
  └── Kelas
  ↓
PERSONALIZED HOME
  ├── Explore Magetan
  ├── Missions
  ├── Progress
  └── Profile

EXPLORE MAGETAN
  ↓
MAP
  ↓
KECAMATAN
  ↓
CULTURAL OBJECT
  ↓
CULTURAL STORY
  ↓
"DI MANA MATEMATIKANYA?"
  ├───────────────┐
  ↓               ↓
AR EXPERIENCE   MATH EXPLORATION
  ↓               ↓
CULTURAL        MATHEMATICAL
IMMERSION       ABSTRACTION
  ↓               ↓
  └───────┬───────┘
          ↓
INTERACTIVE MATHEMATICS
          ↓
DISCOVERY
          ↓
CHALLENGE
          ↓
REWARD
          ↓
PROGRESS
```

Direct mission path remains valid:

```text
HOME
  ↓
MISSIONS
  ↓
LEVEL-AWARE MISSION LIBRARY
  ↓
CHALLENGE
  ↓
REWARD
```

Optional real-world enrichment:

```text
PHYSICAL LOCATION
  ↓
QR / LOCATION / AR
  ↓
SPECIAL CULTURAL EXPERIENCE
  ↓
BONUS MISSION / XP
```

The physical-location path is never the required path to mathematical learning.

---

# 3. STUDENT CONTEXT IS A FIRST-CLASS CONCEPT

Student context is:

```text
Student
├── name
├── level: SD | SMP | SMA
└── grade: 1..12
```

The selected level is not decorative profile information. It is the primary content filter.

Conceptually:

```text
STUDENT
  ↓
JENJANG + KELAS
  ↓
AVAILABLE LEARNING MODULES
  ↓
MATH TOPIC
  ↓
INTERACTION
  ↓
CHALLENGES
  ↓
PROGRESS
```

### Current implementation priority

- SD: active priority
- SMP: active priority
- SMA: future-ready placeholder only

Do not require final per-class curriculum before the architecture works.

Use `gradeRange`/equivalent metadata where useful, but do not create unnecessary duplicate lesson implementations for every class.

A practical first grouping may be:

```text
SD  → class 1–6
SMP → class 7–9
SMA → class 10–12 (future)
```

Only split content more finely when the supplied final material actually requires it.

---

# 4. CURRICULUM CONTENT POLICY

## 4.1 Current material is provisional

The current repository/project materials are a temporary implementation seed.

The team will later provide the complete/final SD, SMP, and possibly SMA materials.

When final material is supplied:

1. Treat it as the authoritative content source.
2. Preserve its terminology and organization unless the team explicitly requests a change.
3. Map it into the data model instead of scattering lesson text throughout JSX.
4. Remove or mark obsolete provisional content.
5. Do not silently reconcile contradictory curriculum information using general knowledge.
6. If two sources conflict, surface the conflict instead of guessing.

## 4.2 No invented educational claims

Agents must not invent:

- curriculum alignment
- grade-level claims
- learning outcomes
- cultural history
- local traditions
- formulas not supported by the provided lesson
- cultural-to-mathematics mappings

If a field is unknown, use a placeholder such as:

```text
[Materi akan ditambahkan]
[Deskripsi budaya akan ditambahkan]
[Foto budaya akan ditambahkan]
```

and keep the schema ready for replacement.

---

# 5. CONTENT MODEL PRINCIPLE

Never assume:

```text
1 culture = 1 lesson
```

Instead, model:

```text
Cultural Object
  ├── Cultural Story
  ├── AR Experience (optional)
  └── Learning Modules
        ├── SD module(s)
        ├── SMP module(s)
        └── SMA module(s) [future]
```

A learning module should conceptually support:

```text
LearningModule
├── id
├── culturalObjectId
├── level
├── gradeRange
├── topic
├── title
├── description
├── learningContent
├── interactionType: 2d | 3d | none
├── geometryType: optional
├── parameters: optional
├── discoveryPrompts
├── challengeIds
└── arExperienceId: optional
```

The exact schema may differ during implementation, but the separation of cultural context from level-specific mathematical interpretation must remain.

Example:

```text
PRING SEDAPUR

SD
→ basic geometry / pattern / area or perimeter, if supported by final material

SMP
→ transformation geometry or other supplied topic

SMA
→ future only when final material exists
```

Do not hardcode these example mappings as final curriculum unless supported by the final source material.

---

# 6. CURRENT REPOSITORY BASELINE

The repository is currently a Vite + React application using JavaScript/JSX.

Current package baseline includes:

- React 18
- React Router DOM 6
- Vite 5
- Supabase JS
- lucide-react
- d3-geo

Current package does **not yet include React Three Fiber / Three.js / Drei**. If interactive 3D is implemented, add the required dependencies deliberately and keep the integration isolated/reusable.

Current high-level source structure includes:

```text
src/
├── App.jsx
├── main.jsx
├── index.css
├── assets/
├── components/
│   ├── FormSiswa.jsx
│   ├── Layout.jsx
│   └── Toast.jsx
├── data/
│   └── magetan-kecamatan.json
├── hooks/
│   ├── useLocations.js
│   └── useToast.jsx
├── lib/
│   └── supabase.js
└── pages/
    ├── HomePage.jsx
    ├── MapPage.jsx
    ├── KecamatanPage.jsx
    ├── LocationPage.jsx
    └── NotFoundPage.jsx
```

The current application already has routes for `/`, `/peta`, `/kecamatan/:kecamatanId`, and `/lokasi/:locationId`.

Do not delete these concepts merely because the new UX introduces additional routes.

---

# 7. LEGACY AR MUST BE HANDLED CAREFULLY

The current codebase already contains an AR-related path in `LocationPage.jsx` that redirects the browser to `dest.arCheckpointUrl`.

This is existing functionality and must be treated as a legacy integration until the new AR architecture is implemented.

Rules:

1. Do not silently delete the existing AR path.
2. Before replacing it, inspect how `arCheckpointUrl` is populated and whether the current AR experience is still usable.
3. Introduce a clean AR abstraction rather than coupling pages directly to a URL.
4. The new UX should support:
   - AR introduction
   - camera/AR state
   - object detection/placement state
   - cultural information
   - completion
   - transition to mathematical exploration
   - graceful fallback when AR is unavailable
5. If true device AR is not feasible within the deadline, provide a convincing progressive fallback using 3D/preview while preserving the same UX contract.
6. Never make AR the only way to reach the math experience.

A useful abstraction is conceptually:

```text
ARExperience
├── intro
├── availability detection
├── experience implementation
├── completion
└── fallback
```

The exact AR library is an implementation decision. Evaluate browser/device support and deadline impact before adding a heavy stack.

---

# 8. INTERACTIVE MATHEMATICS / R3F ARCHITECTURE

Interactive mathematics is a core innovation of MageMatika.

## 8.1 Do not build custom cultural 3D models

Use mathematical primitives:

- box / cuboid
- plane / 2D shape
- cylinder
- cone
- sphere
- prism where needed

A cultural object provides the context; the mathematical model is intentionally simplified.

Example:

```text
Bamboo
↓
Cylinder
```

The goal is mathematical abstraction, not photorealistic reconstruction.

## 8.2 React Three Fiber

If R3F is used, understand the mental model:

```text
React component tree
        ↓
<Canvas>
        ↓
<mesh>
  <geometry />
  <material />
</mesh>
```

React state controls mathematical parameters.

For example:

```text
radius state
height state
      ↓
Cylinder geometry
      ↓
volume calculation
      ↓
UI values / challenge evaluation
```

The 3D scene must remain a presentation layer over deterministic math state.

Do not put core mathematical formulas exclusively inside Three.js components.

Prefer:

```text
math/domain logic
        ↓
React state
        ↓
3D visualization
```

rather than:

```text
3D component
  └── owns all business logic
```

## 8.3 Reusable geometry engine

Prefer reusable components such as:

```text
InteractiveMathScene
GeometryModel
GeometryControls
DimensionLabel
MathValuePanel
DiscoveryPrompt
ChallengeController
```

The model should be driven by configuration rather than duplicated page-specific geometry code.

Conceptually:

```js
{
  type: 'cylinder',
  parameters: {
    radius: { min, max, step, value },
    height: { min, max, step, value }
  },
  calculations: ['volume']
}
```

Exact implementation may differ.

## 8.4 Not everything is 3D

Use 2D interaction for:

- perimeter
- area
- translation
- reflection
- rotation
- patterns
- other planar concepts

Use 3D when spatial manipulation materially improves understanding:

- volume
- surface area
- cylinder
- cuboid
- cone
- sphere
- spatial relationships

---

# 9. LEARNING LOOP IMPLEMENTATION

A learning module should support:

```text
CULTURAL STORY
  ↓
OPTIONAL AR
  ↓
MATHEMATICAL ABSTRACTION
  ↓
INTERACTIVE EXPLORATION
  ↓
DISCOVERY
  ↓
CHALLENGE
  ↓
REWARD
```

Do not immediately throw a conventional multiple-choice question at the student.

The interactive stage should allow observation first.

Example:

```text
"Ubah radius secara perlahan."
↓
student manipulates slider
↓
"Apa yang berubah?"
↓
student observes live values
↓
challenge
```

This is the pedagogical distinction from a basic quiz app.

---

# 10. MISSIONS

Missions are the application/practice layer.

There are two valid entry paths:

### Embedded

```text
Cultural Object
→ Math Exploration
→ Discovery
→ Challenge
```

### Direct

```text
Home
→ Missions
→ Level-aware Challenge Library
→ Challenge
```

Mission content must be filtered by the student's level.

At minimum, conceptually support:

```text
level
gradeRange
topic
culturalObjectId
difficulty
challengeType
```

Do not mix SD/SMP content indiscriminately in the student's default mission list.

---

# 11. PROGRESS / GAMIFICATION

Progress should reinforce learning, not competition.

Track conceptually:

- XP
- completed challenges
- discovered cultural objects
- explored kecamatan
- discovered math concepts
- AR experiences
- badges

Do not add leaderboards unless explicitly requested.

AR completion is never required for mathematical progress.

---

# 12. STUDENT ONBOARDING

The current `FormSiswa` already stores name/class in `sessionStorage`.

Evolve this carefully to include `level`.

Target profile:

```text
name
level
grade
```

Use labels such as:

- Nama Lengkap
- Jenjang
- Kelas

Class options should depend on level:

```text
SD  → 1–6
SMP → 7–9
SMA → 10–12 (future/placeholder)
```

Do not add email/password authentication.

Supabase persistence can later be layered onto this profile without changing the UX contract.

---

# 13. SUPABASE

Supabase is the intended persistence layer.

Current repository already contains `src/lib/supabase.js`.

Before creating tables:

1. Inspect the existing Supabase client/config.
2. Inspect any existing SQL/schema/migrations in the repository.
3. Do not expose service-role credentials in the frontend.
4. Use environment variables for public Supabase configuration.
5. Keep frontend access compatible with Supabase RLS.

A conceptual future schema may include:

```text
students
├── id
├── name
├── level
├── grade
└── created_at

cultural_objects
├── id
├── kecamatan_id
├── name
├── description
├── history
├── photo_url
└── ...

learning_modules
├── id
├── cultural_object_id
├── level
├── grade_range
├── topic
├── content
├── interaction_config
└── ...

challenges
├── id
├── learning_module_id
├── level
├── grade_range
├── prompt
├── config
└── ...

student_progress
├── student_id
├── module_id
├── challenge_id
├── status
├── score
└── updated_at
```

This is conceptual guidance, not permission to create a huge schema without checking the existing project state.

For the deadline, prefer the smallest schema that supports the approved UX.

---

# 14. DATA-FIRST CONTENT ARCHITECTURE

Do not put large amounts of educational/cultural content directly into JSX.

Prefer:

```text
src/data/
```

for temporary local seed content, or Supabase for production content.

Keep content separate from presentation.

Bad:

```jsx
<h2>Long hardcoded lesson text...</h2>
```

Preferred:

```jsx
<LessonContent module={module} />
```

with content coming from a structured object/query.

This is especially important because final SD/SMP/SMA material will arrive later.

---

# 15. CULTURAL DATA POLICY

Current `magetan-kecamatan.json` is useful existing data and must be preserved unless intentionally migrated.

Do not delete or rewrite all location data merely to introduce learning modules.

Separate:

```text
Kecamatan/location data
```

from:

```text
Learning module data
```

A cultural object can belong to a kecamatan while supporting multiple learning modules.

Use placeholders for missing photos/assets/descriptions until the non-technical team provides final assets.

Never invent local history to fill the UI.

---

# 16. ROUTING GUIDELINES

Current routes include:

```text
/
/peta
/kecamatan/:kecamatanId
/lokasi/:locationId
```

Future routes may include concepts such as:

```text
/onboarding
/missions
/missions/:missionId
/learning/:moduleId
/math/:moduleId
/ar/:experienceId
/progress
/profile
```

Do not blindly create every route at once.

Choose routes that match the implemented feature and keep route responsibilities clear.

Use route params for stable IDs, not display names.

Avoid encoding large state objects in URLs.

---

# 17. UI / DESIGN SYSTEM

The approved MageMatika visual direction is:

- deep navy / dark blue foundation
- blue → purple gradient accents
- glassmorphism-inspired cards used selectively
- rounded corners
- modern friendly typography
- Lucide icons
- subtle geometric/cultural visual treatment
- strong mobile usability

Do not replace the visual identity with a generic education dashboard.

The design should feel:

- modern
- interactive
- educational
- culturally grounded
- not childish
- not overly corporate

### Age adaptation

Keep one brand.

For SD:

- simpler language
- larger visual cues
- simpler controls
- stronger visual feedback

For SMP:

- more analytical information
- richer controls
- more detailed mathematical feedback

Do not create completely separate themes for SD and SMP.

---

# 18. ACCESSIBILITY

Always consider:

- readable contrast
- keyboard accessibility
- visible focus states
- large touch targets
- labels for sliders
- non-color-only feedback
- reduced motion where appropriate
- accessible error messages
- mobile safe areas for AR

Interactive 3D controls must have equivalent readable values in normal HTML UI.

A student must not need to visually interpret the 3D canvas alone to understand the mathematics.

---

# 19. PERFORMANCE

The project is deadline-constrained.

Prefer:

- lightweight components
- lazy loading for heavy 3D/AR routes
- code splitting for R3F/Three.js/AR dependencies
- small placeholder assets
- avoiding unnecessary re-renders
- memoization only when it provides measurable benefit

Do not load the full 3D/AR stack on the landing page if it can be lazy-loaded.

Avoid expensive map or canvas work during ordinary Home navigation.

---

# 20. RESPONSIVE REQUIREMENTS

Primary target:

- mobile
- tablet
- desktop

Especially validate:

- onboarding form
- map
- cultural story
- sliders
- interactive math canvas
- AR viewport
- challenge controls

Do not make the desktop layout the source of truth for mobile.

---

# 21. COMPONENT ARCHITECTURE

Prefer reusable components over page-specific duplication.

Likely reusable concepts include:

```text
Layout
StudentOnboarding / FormSiswa
GradeSelector
ClassSelector
StudentProfile
CulturalCard
CulturalStory
LearningModuleCard
ARExperience
ARFallback
MathExploration
InteractiveMathScene
GeometryModel
GeometryControls
DimensionLabel
MathValuePanel
DiscoveryPrompt
ChallengeCard
MissionCard
ProgressCard
BadgeCard
```

Do not create abstractions merely for abstraction's sake.

A component should be extracted when it has:

- reusable behavior
- reusable UI
- meaningful domain responsibility

---

# 22. STATE MANAGEMENT

Do not introduce Redux or another global state library unless there is a demonstrated need.

Use:

- local React state for local interaction
- context/hooks for small cross-page concerns
- sessionStorage for lightweight current student onboarding state where appropriate
- Supabase for persisted student/content/progress data

Student context should have one clear source of truth.

Avoid reading arbitrary `sessionStorage` keys throughout dozens of components.

If the project grows, introduce a small `StudentContext` or equivalent hook.

---

# 23. MATH DOMAIN LOGIC

Mathematical calculations must be deterministic and testable outside the 3D renderer.

Prefer pure functions such as:

```text
calculateArea(...)
calculatePerimeter(...)
calculateVolume(...)
calculateTransformation(...)
```

depending on supplied curriculum.

Do not duplicate formulas across UI components.

Units must be explicit.

Example:

```text
cm
cm²
cm³
```

Do not silently mix units.

Do not add mathematical topics merely because a geometry primitive exists. The curriculum/data model determines what is taught.

---

# 24. INTERACTION CONFIGURATION

Interactive math should be configuration-driven where practical.

Conceptually:

```js
{
  type: 'cylinder',
  parameters: {
    radius: { min: 1, max: 10, step: 0.5 },
    height: { min: 5, max: 30, step: 1 }
  },
  calculations: ['volume'],
  prompts: [...]
}
```

The geometry component should consume configuration rather than knowing which cultural object it represents.

This makes it possible for final curriculum content to be inserted later without rebuilding the 3D engine.

---

# 25. AR FALLBACK CONTRACT

Every AR-enabled learning object must have a fallback.

Possible fallback:

```text
AR unavailable
↓
"Lihat Model 3D"
↓
interactive mathematical / cultural preview
```

For desktop:

```text
"Pengalaman AR terutama tersedia di perangkat mobile."
↓
QR / mobile continuation or preview
```

Never leave the user at a dead-end permission/error screen.

---

# 26. ERROR / EMPTY STATES

Every data-driven page should have:

- loading state
- empty state
- error state
- retry/back path where relevant

Never render broken `undefined` content.

If final material is missing, show a deliberate placeholder instead of fake content.

---

# 27. SECURITY

Never:

- commit `.env` secrets
- expose Supabase service-role keys
- put private credentials in source
- trust arbitrary URL/query parameters for privileged operations
- store sensitive student data unnecessarily

Student onboarding should remain minimal.

---

# 28. TESTING / VALIDATION

At minimum, before considering a significant feature complete:

1. `npm run lint`
2. `npm run build`
3. manually test the primary user flow
4. test mobile-sized viewport
5. test a missing-data state
6. test a level mismatch / empty-content state

For math logic, test pure calculation functions with representative values and edge cases.

For interactive geometry, verify that:

```text
slider changes
→ geometry changes
→ displayed dimensions change
→ calculation changes
→ challenge state remains consistent
```

---

# 29. AGENT WORKFLOW

When receiving a task, follow this order:

### Step 1 — Understand

Read this file and the relevant source files.

### Step 2 — Inspect

Search the repository for existing implementations before adding new ones.

### Step 3 — Plan

State:

- affected files
- architectural impact
- dependencies
- data impact
- risk

For a small change, keep the plan short.

### Step 4 — Implement incrementally

Prefer small coherent changes over a huge rewrite.

### Step 5 — Validate

Run lint/build and relevant manual tests.

### Step 6 — Report

Summarize:

- what changed
- files changed
- what was intentionally left as placeholder
- validation result
- known limitations

---

# 30. WHEN CONTENT IS NOT FINAL

This is a special project rule.

The development team will provide final SD/SMP/SMA curriculum and cultural content later.

Until then:

- use current project content as seed data
- use placeholders where necessary
- build reusable schemas/components
- do not optimize the entire architecture around temporary lesson wording
- do not make irreversible assumptions about grade-specific content

When final content arrives, the agent should first:

1. inspect and map the content
2. identify new/changed topics
3. identify cultural-object mappings
4. identify level/grade ranges
5. identify required 2D vs 3D interactions
6. identify challenge types
7. identify AR requirements
8. update the data layer
9. validate that UI components can consume it without page-specific rewrites

If final content is delivered as documents, preserve the source terminology and do not silently "correct" it.

---

# 31. DEADLINE / SCOPE CONTROL

Deadline: **28 August 2026**.

Priority order:

## P0 — Core learning product

1. Student onboarding
2. SD/SMP level-aware content
3. Explore / Map / Kecamatan
4. Cultural story
5. Mathematical exploration
6. Challenges
7. Progress

## P1 — Innovation

8. Reusable interactive 2D/3D math engine
9. AR cultural immersion
10. AR → math transition
11. optional bonus/location AR path

## P2 — Polish

12. badges / XP refinement
13. animations
14. additional cultural objects
15. advanced responsive polish

## P3 — Future

16. SMA final content
17. advanced AR
18. custom 3D cultural models
19. non-essential social/multiplayer features

If time becomes constrained, protect P0 first.

Never sacrifice the complete learning loop merely to add another flashy feature.

---

# 32. WHAT COUNTS AS A SUCCESSFUL IMPLEMENTATION

The student should be able to complete this without visiting a physical location:

```text
Open MageMatika
↓
Enter name + level + class
↓
See personalized Home
↓
Explore Magetan
↓
Open a cultural object
↓
Read cultural story
↓
Optionally experience AR
↓
See mathematical abstraction
↓
Manipulate the math model
↓
Observe what changes
↓
Complete a challenge
↓
Receive feedback/reward
↓
See progress
```

And a student should also be able to do:

```text
Home
↓
Missions
↓
Level-filtered challenge
↓
Challenge
↓
Reward
```

---

# 33. FINAL PRODUCT PRINCIPLES

Keep these principles in mind when making any decision:

### Principle 1
**Culture is the context, not decoration.**

### Principle 2
**AR immerses students in culture; it does not gate mathematics.**

### Principle 3
**Interactive mathematics is the main innovation in the learning experience.**

### Principle 4
**The same cultural object may teach different mathematics at different levels.**

### Principle 5
**Student level is a first-class content filter.**

### Principle 6
**Use 3D when it improves mathematical understanding, not because 3D is fashionable.**

### Principle 7
**Final curriculum content will replace provisional content; architecture must make that replacement cheap.**

### Principle 8
**A smaller complete learning loop is better than a larger collection of unfinished features.**

### Principle 9
**Never invent cultural or curriculum facts to make a screen look complete.**

### Principle 10
**Preserve working behavior and evolve the codebase incrementally.**

---

# 34. AGENT DECISION RULE

When unsure, ask:

```text
Does this change make the student better able to:

1. discover Magetan culture?
2. see the mathematical idea inside it?
3. manipulate and observe the mathematics?
4. apply the idea in a challenge?
5. do so at the correct learning level?
```

If the answer is no, question whether the feature belongs in the deadline-critical build.

If the change concerns missing curriculum/cultural facts, do not guess. Use a placeholder and request the source material.

---

# 35. CURRENT IMPLEMENTATION NOTE

The existing repository is an early implementation, not the final architecture.

It already contains useful foundations:

- React/Vite
- React Router
- Magetan map data
- student form
- Supabase client
- cultural/location pages
- existing AR checkpoint integration

The new architecture should **evolve these foundations** toward:

```text
Student Context
      ↓
Level-aware Content
      ↓
Cultural Context
      ↓
AR (optional)
      ↓
Mathematical Abstraction
      ↓
Reusable Interactive Math Engine
      ↓
Challenges
      ↓
Progress
```

Do not discard the existing foundations without a concrete technical reason.

---

# END OF AGENTS.md
