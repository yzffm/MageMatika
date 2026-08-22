# AGENTS.md — MageMatika Engineering Constitution

> **Single source of truth for AI coding agents.** Read this file fully before changing code, UI, data, dependencies, routes, database schema, AR, or 3D features.
>
> **Project:** MageMatika  
> **Domain:** Ethnomathematics education using Magetan cultural context  
> **Primary learning scope:** SD + SMP  
> **Future scope:** SMA when final content and time allow  
> **Deadline:** 28 August 2026

---

## 0. NON-NEGOTIABLE RULES

1. Inspect the existing repository before changing it. Do not assume it is a fresh Vite starter.
2. Do not rewrite the application from scratch. Refactor incrementally and preserve working behavior unless the task explicitly replaces it.
3. Do not invent cultural facts, historical claims, curriculum alignment, formulas, learning objectives, measurements, or question answers. Missing information must use an explicit placeholder and be reported.
4. Current curriculum/content is provisional. When the team supplies final SD/SMP/SMA material, that material becomes the source of truth.
5. The core mathematical learning path must never require a physical location, GPS, QR, camera, or AR. These are enrichment mechanisms.
6. AR and interactive mathematics have different jobs:
   - **AR = cultural immersion/context.**
   - **Interactive mathematics = mathematical abstraction and discovery.**
7. Do not make every lesson 3D. Use 2D interaction when it communicates the concept better; use R3F/Three.js when spatial manipulation adds genuine educational value.
8. Do not build photorealistic/custom 3D cultural objects unless explicitly requested. Prefer reusable mathematical primitives.
9. Do not add email/password authentication. Student onboarding is intentionally lightweight: name + jenjang + kelas.
10. SMA must remain future-ready but must not contain fabricated content.
11. Do not introduce large unrelated dependencies or architectural rewrites without justification against the deadline.
12. Keep the application mobile-first and responsive. The primary demo experience is on a phone.
13. After meaningful implementation work, run the available lint/build/test checks and fix regressions before declaring the task complete.
14. If a task requires human-only verification (especially physical AR/camera testing), implement what can be implemented, clearly state the manual step, and ask the user to perform it. Never falsely mark it verified.
15. Explicit user instructions may supersede this document when they intentionally change product scope. When that happens, update this file rather than leaving contradictory rules behind.

---

# 1. PRODUCT VISION

MageMatika is a web learning experience based on **ethnomathematics**: Magetan culture provides authentic context for learning mathematics.

MageMatika is **not** merely a cultural gallery with a quiz attached, and it is not merely a checkpoint game.

The intended learning loop is:

```text
CULTURE
   ↓
OBSERVE
   ↓
CULTURAL STORY
   ↓
"DI MANA MATEMATIKANYA?"
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

The core educational relationship is:

> **Culture gives context. Mathematics explains patterns, shapes, measurements, and relationships. Interaction lets students discover those relationships.**

Innovation should come primarily from this learning experience, not from adding technology for its own sake.

---

# 2. FINAL UX / INFORMATION ARCHITECTURE

The approved conceptual flow is:

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
```

## 2.1 Explore path

```text
HOME
  ↓
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
  ├──────────────────────┐
  ↓                      ↓
AR EXPERIENCE       MATH EXPLORATION
  ↓                      ↓
CULTURAL             MATHEMATICAL
IMMERSION            ABSTRACTION
                         ↓
                 INTERACTIVE MATH
                         ↓
                     DISCOVERY
                         ↓
                    CHALLENGE
                         ↓
                       REWARD
                         ↓
                      PROGRESS
```

AR is optional enrichment. A student must always be able to reach mathematical exploration without physically visiting the location or successfully starting AR.

## 2.2 Mission path

Math challenges are **not exclusive to the mission entry point**.

There are two valid ways to reach a challenge:

```text
CULTURAL OBJECT
  ↓
MATH EXPLORATION
  ↓
DISCOVERY
  ↓
CHALLENGE
```

or:

```text
HOME
  ↓
MISSIONS
  ↓
LEVEL-AWARE MISSION LIBRARY
  ↓
CHALLENGE
```

The mission system is therefore the practice/assessment layer, not the only place where mathematics exists.

## 2.3 Optional real-world enrichment

```text
PHYSICAL LOCATION
  ↓
QR / LOCATION / AR
  ↓
SPECIAL CULTURAL EXPERIENCE
  ↓
OPTIONAL BONUS / XP / MISSION
```

Never gate the main mathematics curriculum behind this path.

---

# 3. STUDENT CONTEXT AND PERSONALIZATION

Student identity is a first-class product concept:

```text
Student
├── name
├── level: SD | SMP | SMA
└── grade: 1..12
```

The student's level is not decorative. It determines which learning modules and challenges are shown.

```text
STUDENT
  ↓
JENJANG + KELAS
  ↓
AVAILABLE CONTENT
  ↓
MATH TOPIC
  ↓
INTERACTION
  ↓
CHALLENGES
  ↓
PROGRESS
```

Current priority:

- **SD:** active
- **SMP:** active
- **SMA:** future-ready placeholder only

Initial class ranges:

```text
SD  → 1–6
SMP → 7–9
SMA → 10–12 (future)
```

Do not create unnecessary duplicate implementations for every class. Use `gradeRange` or equivalent metadata and only split content when final supplied material requires it.

---

# 4. ONBOARDING UX

The onboarding form should remain simple and match the visual language approved through the design process.

Fields:

```text
Nama Lengkap
Jenjang
Kelas
```

Class choices depend on jenjang.

The current application already uses `sessionStorage` for student context. Evolve it carefully rather than introducing complex authentication.

Conceptual session shape:

```js
{
  studentName,
  studentLevel,
  studentClass
}
```

Backward compatibility with existing `studentName` / `studentClass` keys may be retained during migration if existing AR pages still depend on them.

Do not add email/password, OAuth, or a full account system unless explicitly requested.

---

# 5. GRADE-AWARE CONTENT ARCHITECTURE

Never model the product as:

```text
1 cultural object = 1 lesson
```

Use:

```text
CULTURAL OBJECT
├── Cultural Story
├── Media / Photos
├── AR Experience (optional)
└── Learning Modules
      ├── SD module(s)
      ├── SMP module(s)
      └── SMA module(s) [future]
```

A conceptual learning-module shape is:

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

The exact implementation schema may evolve, but the separation between cultural context and level-specific mathematical interpretation is mandatory.

One cultural object can therefore support different mathematical lessons for SD and SMP without duplicating the cultural object itself.

Do not hardcode example mappings as final curriculum unless the supplied material explicitly supports them.

---

# 6. CURRICULUM AND CONTENT POLICY

## 6.1 Provisional content

The current repository/project material is seed content only.

The team will provide final material for SD, SMP, and possibly SMA later.

When final material arrives:

1. Treat it as authoritative.
2. Preserve its terminology, organization, and intended scope.
3. Map it into data/content structures instead of scattering text across JSX.
4. Replace or explicitly mark provisional content.
5. Do not silently correct or reconcile conflicting source material using general knowledge.
6. If two supplied sources conflict, surface the conflict to the user.

## 6.2 Missing data

Use explicit placeholders such as:

```text
[Materi akan ditambahkan]
[Deskripsi budaya akan ditambahkan]
[Foto budaya akan ditambahkan]
[Ukuran asli akan ditambahkan]
```

Never invent:

- cultural history
- cultural ownership/origin claims
- field measurements
- curriculum claims
- learning outcomes
- formulas or answers not supported by the lesson source

---

# 7. CULTURAL EXPERIENCE + AR

AR remains part of MageMatika. It is **not removed** by the new interactive-math architecture.

Its role is:

```text
PHOTO / CULTURAL OBJECT
       ↓
      AR
       ↓
CULTURAL IMMERSION
       ↓
"THIS IS THE REAL OBJECT / CONTEXT"
```

Interactive mathematics has a different role:

```text
CULTURAL CONTEXT
       ↓
MATHEMATICAL ABSTRACTION
       ↓
MANIPULABLE GEOMETRY
```

The two experiences complement one another.

## 7.1 Existing legacy AR

The current repository contains a legacy AR integration where `LocationPage.jsx` can navigate to `dest.arCheckpointUrl`.

Treat this as existing functionality during migration.

Before replacing it:

1. Inspect the current AR files and data.
2. Determine which parts are reusable.
3. Preserve working behavior until the replacement is verified.
4. Remove obsolete code only after the replacement is functional.

Do not silently delete the existing AR implementation.

## 7.2 AR implementation principle

The exact AR library is an implementation decision, not a permanent product requirement.

If the existing A-Frame + MindAR implementation remains viable on the target Android devices, it can be retained/refactored.

If a new approach is considered, compare:

- Android Chrome support
- camera permissions
- marker/image-target reliability
- bundle/runtime complexity
- development time
- physical-device testability

Do not add a heavy AR stack merely because it is technically interesting.

## 7.3 AR fallback

AR must have a graceful fallback.

Conceptually:

```text
AR INTRO
  ↓
CHECK AVAILABILITY
  ├── available → AR EXPERIENCE
  └── unavailable → 3D / VISUAL PREVIEW
  ↓
CULTURAL CONTEXT
  ↓
MATH EXPLORATION
```

The fallback must not trap the student on a camera error screen.

---

# 8. INTERACTIVE MATHEMATICS — CORE INNOVATION

Interactive mathematics is a primary innovation of the project.

The goal is not to create realistic 3D cultural assets.

The goal is to let students manipulate mathematical representations derived from cultural context.

Example:

```text
CULTURAL OBJECT
      ↓
SIMPLIFIED MATHEMATICAL REPRESENTATION
      ↓
SLIDER / ROTATION / MANIPULATION
      ↓
LIVE DIMENSIONS
      ↓
LIVE CALCULATION
      ↓
DISCOVERY
```

For example, a cylindrical cultural form may be represented by a cylinder primitive so the student can change radius/height and observe volume changes.

This is a **mathematical abstraction**, not a claim that the cultural object literally is a perfect cylinder.

---

# 9. REACT THREE FIBER / 3D ARCHITECTURE

If R3F is used, treat it as a visualization layer driven by React/domain state.

Mental model:

```text
Math/domain state
      ↓
React state
      ↓
R3F <Canvas>
      ↓
mesh + geometry + material
      ↓
visual result
```

Example:

```text
radius state
height state
      ↓
Cylinder geometry
      ↓
Volume calculation
      ↓
UI values + challenge evaluation
```

Core formulas and challenge logic must **not** live only inside a Three.js component.

Prefer:

```text
math/domain logic
       ↓
React state
       ↓
visualization
```

not:

```text
3D component owns all business logic
```

## 9.1 Reusable geometry engine

Build reusable primitives/components rather than one custom 3D implementation per cultural object.

Useful conceptual components:

```text
InteractiveMathScene
GeometryModel
GeometryControls
DimensionLabel
MathValuePanel
DiscoveryPrompt
ChallengeController
```

Possible supported geometry types:

```text
rectangle / plane
triangle
circle
cuboid / box
cylinder
cone
sphere
prism
```

Only implement geometry types actually required by supplied content.

## 9.2 Configuration-driven geometry

Prefer configuration such as:

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

The exact schema is implementation-dependent.

The key requirement is reusability.

## 9.3 2D vs 3D

Use 2D when the concept is planar:

- perimeter
- area
- planar shapes
- patterns
- transformations
- reflection/rotation when 3D adds no value

Use 3D when spatial manipulation materially improves understanding:

- volume
- surface area
- cylinder
- cuboid
- cone
- sphere
- spatial relationships

Do not force R3F into a lesson just to make the UI look more advanced.

---

# 10. LEARNING LOOP AND PEDAGOGY

A lesson should prefer observation and manipulation before assessment:

```text
CULTURAL STORY
   ↓
OPTIONAL AR
   ↓
MATHEMATICAL ABSTRACTION
   ↓
INTERACTIVE EXPLORATION
   ↓
DISCOVERY PROMPT
   ↓
CHALLENGE
   ↓
REWARD
```

Avoid reducing the experience to:

```text
Question → four choices → score
```

Example:

```text
"Ubah panjang secara perlahan."
       ↓
student moves slider
       ↓
area changes live
       ↓
"Apa yang kamu amati?"
       ↓
challenge
```

The interactive stage should make the mathematical relationship observable.

---

# 11. MISSIONS AND CHALLENGES

Missions are the practice/assessment layer.

They are accessible from Home and can also be reached naturally after a learning module.

Mission/challenge data should conceptually support:

```text
id
level
gradeRange
topic
culturalObjectId
learningModuleId
difficulty
challengeType
question/prompt
answer/evaluation data
reward
```

Filter the default mission library by the student's level.

Do not mix SD and SMP challenges in the same default list without clear labeling.

Challenges may be:

- numerical
- multiple choice
- observation-based
- manipulation-based
- short answer

Use the simplest interaction that evaluates the intended learning objective.

---

# 12. PROGRESS AND GAMIFICATION

Progress should reinforce learning rather than competition.

Potential progress signals:

- XP
- completed challenges
- explored cultural objects
- explored kecamatan
- discovered math concepts
- completed AR experiences
- badges

Do not add a leaderboard unless explicitly requested.

AR completion is never a prerequisite for mathematical progress.

---

# 13. MAP AND MAGETAN NAVIGATION

The map remains an important exploration feature.

Use the existing local GeoJSON/d3-geo approach. Do not replace it with Google Maps, Mapbox, or another tile API without explicit approval.

The project represents Magetan's 18 kecamatan.

The existing GeoJSON may contain village-level polygons grouped by `kecamatan`. Preserve the verified existing data structure and inspect it before changing rendering logic.

Conceptual flow:

```text
MAP
 ↓
KECAMATAN
 ↓
CULTURAL OBJECTS AVAILABLE THERE
```

Inactive/empty kecamatan may remain visible as future content, but do not fabricate cultural data for them.

The map is an exploration/navigation mechanism, not a mandatory gate for missions.

---

# 14. DATA / SOURCE OF TRUTH

Keep content data separate from presentation components.

The existing project may contain `public/data/locations.json` or equivalent content files. Before replacing them, inspect the current schema and consumers.

The preferred conceptual separation is:

```text
content data
   ↓
selectors / hooks
   ↓
feature components
   ↓
pages
```

Avoid embedding large cultural stories, curriculum text, formulas, and challenge banks directly inside JSX.

## 14.1 Data ownership

```text
Cultural Object
  = cultural identity/context

Learning Module
  = level-specific mathematics

Challenge
  = assessment/practice

Progress
  = student state
```

Do not duplicate the same cultural story for every grade unless presentation genuinely differs.

---

# 15. SUPABASE / PERSISTENCE

Supabase is the intended persistence layer.

Before changing the database:

1. Inspect `src/lib/supabase.js` and current environment variables.
2. Inspect existing SQL/schema/migrations.
3. Reuse existing structures when appropriate.
4. Never expose a service-role key in frontend code.
5. Keep RLS enabled and explicitly test policies.

A future conceptual schema may contain:

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
├── media
└── ar_experience_id

learning_modules
├── id
├── cultural_object_id
├── level
├── grade_range
├── topic
├── interaction_type
└── content

challenges
├── id
├── learning_module_id
├── level
├── type
└── evaluation_data

progress
├── id
├── student_id/session_id
├── challenge_id
├── score
├── xp
└── created_at
```

This is a conceptual model, not an instruction to create all tables immediately.

Do not create a large database schema until the current feature requires it.

---

# 16. TECHNICAL ARCHITECTURE

The application remains a client-side Vite + React SPA.

Current baseline:

```text
React
React Router
Vite
Supabase JS
lucide-react
d3-geo
```

R3F/Three.js/Drei may be added for interactive math after deliberate evaluation.

A sensible evolving feature structure is:

```text
src/
├── app/
├── pages/
├── components/
├── features/
│   ├── student/
│   ├── exploration/
│   ├── culture/
│   ├── learning/
│   ├── math/
│   ├── challenges/
│   ├── progress/
│   └── ar/
├── domain/
│   └── math/
├── data/
├── hooks/
├── lib/
└── assets/
```

Do not reorganize the whole repository only for aesthetic reasons. Introduce folders when they improve a feature being actively implemented.

---

# 17. LEGACY ARCHITECTURE MIGRATION RULES

The previous project specification used a strict three-layer model where AR lived in separate static HTML pages.

That specification is **obsolete as the primary product architecture**.

The new target is a unified React learning experience with:

```text
React application
├── navigation/exploration
├── cultural content
├── student personalization
├── interactive mathematics / R3F
├── challenges
├── progress
└── AR integration
```

However, legacy AR HTML files may remain temporarily if they are still the most reliable implementation.

Therefore:

- Do not delete them merely because the architecture changed.
- Do not allow them to dictate the new UX.
- Wrap/migrate them behind a clean feature boundary where practical.
- Remove them only after the replacement is verified.

The old "AR must be a separate HTML page" rule is no longer a product lock.

---

# 18. UI / UX IMPLEMENTATION RULES

The visual direction has already been explored through Google Stitch. Treat the approved Stitch design as a visual reference, not as a license to generate unrelated screens.

The UI should be:

- mobile-first
- educational
- modern
- slightly playful
- cohesive across onboarding, exploration, AR, math, missions, and progress
- visually rich enough to feel innovative without becoming noisy

Use a consistent design system for:

- typography
- spacing
- cards
- buttons
- icons
- gradients/visual accents
- progress indicators
- modal/sheet behavior

Do not introduce a new visual language on individual pages.

Accessibility basics remain required:

- readable contrast
- sufficiently large touch targets
- labels for controls
- clear loading/error states
- keyboard-safe interaction where applicable
- avoid relying on color alone

---

# 19. PERFORMANCE AND DEVICE CONSTRAINTS

Primary experience is mobile web, especially Android Chrome.

For R3F:

- keep geometry simple
- avoid unnecessary high-poly assets
- dispose resources when appropriate
- avoid rendering expensive scenes when not visible
- keep canvas size reasonable
- avoid unnecessary animation loops
- use lazy loading where appropriate

For AR:

- test on a real Android device
- handle camera permission failure
- handle target-not-found state
- handle target-lost state
- avoid loading AR libraries on every page if they are not needed

For content:

- compress images
- lazy-load heavy media
- avoid large bundles
- keep cultural photos optimized for mobile

---

# 20. AGENT WORKFLOW

Every meaningful task should follow:

```text
1. READ AGENTS.md
       ↓
2. INSPECT CURRENT CODE
       ↓
3. IDENTIFY EXISTING DEPENDENCIES / ROUTES / DATA
       ↓
4. STATE THE PLAN
       ↓
5. IMPLEMENT THE SMALLEST COHERENT CHANGE
       ↓
6. RUN BUILD / LINT / RELEVANT TESTS
       ↓
7. VISUALLY VERIFY WHEN UI IS INVOLVED
       ↓
8. REPORT WHAT CHANGED + WHAT NEEDS HUMAN VERIFICATION
```

Before architectural changes, inspect the existing implementation rather than assuming the old architecture described in historical documentation still exists.

## 20.1 When to ask the human

Ask for intervention when you need:

- physical Android/AR testing
- camera permission testing
- real cultural assets not yet supplied
- final curriculum/content
- a product decision not specified here
- credentials or environment variables that cannot safely be inferred
- confirmation that a risky migration is acceptable

Do not ask for confirmation for trivial implementation details that are already specified.

## 20.2 Do not over-engineer

The deadline is 28 August 2026 and the technical team is effectively one person assisted by AI agents.

Prefer:

```text
working + clear + reusable + testable
```

over:

```text
perfect + abstract + over-generalized
```

---

# 21. VERIFICATION RULES

## Agent-verifiable

The agent should verify:

- no syntax errors
- build succeeds
- routes resolve
- imports resolve
- no obvious console errors
- data JSON is valid
- level filtering behaves correctly
- geometry state/calculation consistency
- responsive layout at representative viewport sizes

## Human-required

The agent must not self-certify:

- camera permission behavior on physical devices
- AR target detection reliability
- physical-device rendering/performance
- real-world cultural accuracy
- final curriculum correctness
- final field measurements

For these, explicitly report the manual verification needed.

---

# 22. MILESTONES — NEW VERTICAL-SLICE ORDER

The old milestone order based on individual technical layers is superseded.

Use vertical slices so a working product exists early.

### V1 — Student onboarding

```text
Landing → Onboarding → Personalized Home
```

DoD:
- name, jenjang, kelas work
- session context persists
- Home displays the correct level context

### V2 — Exploration

```text
Home → Map → Kecamatan → Cultural Object → Story
```

DoD:
- existing map still works
- cultural object data renders
- no fabricated content

### V3 — Interactive mathematics

```text
Cultural Object → Math Exploration → Manipulation → Live calculation
```

DoD:
- at least one reusable geometry type works end-to-end
- controls update visualization and deterministic math state
- mobile interaction works

### V4 — Challenge

```text
Math Exploration → Discovery → Challenge → Reward
```

DoD:
- challenge is grade-aware
- evaluation is deterministic
- result/reward is visible

### V5 — AR integration

```text
Cultural Object → AR → Cultural immersion → Math Exploration
```

DoD:
- existing or new AR implementation is reachable
- fallback exists
- human verifies on physical Android device

### V6 — Missions + Progress

```text
Home → Missions → Level-aware challenges → Progress
```

DoD:
- mission list respects student level
- progress/reward state is visible

### V7 — Final content integration

Replace provisional material with supplied final content/assets.

DoD:
- SD/SMP content mapped correctly
- no accidental invented content remains
- placeholders are removed where final data exists

### V8 — End-to-end demo hardening

```text
Onboarding
→ Home
→ Explore
→ Culture
→ AR / Math
→ Challenge
→ Progress
```

DoD:
- blind test by a person who has not used the app before
- physical AR test if AR is part of demo
- production build works
- Vercel deployment works

---

# 23. PRIORITY UNDER DEADLINE PRESSURE

When time becomes constrained, prioritize in this order:

### Tier A — must work

1. Student onboarding
2. Grade-aware Home
3. Cultural exploration
4. At least one strong interactive mathematics experience
5. Challenge flow
6. Stable mobile UX

### Tier B — high-value innovation

7. AR cultural immersion
8. Multiple reusable geometry types
9. Mission library
10. Progress/reward persistence

### Tier C — polish / stretch

11. Additional cultural objects
12. Additional geometry types not required by curriculum
13. Advanced animations
14. Advanced gamification
15. SMA content

Never sacrifice the core learning loop to increase the number of cultural checkpoints.

A smaller number of complete, polished, pedagogically coherent experiences is preferable to many incomplete checkpoints.

---

# 24. CURRENT DATA / REPOSITORY MIGRATION NOTES

The repository may still contain assumptions from the previous checkpoint-based MVP, including fields such as:

```text
kecamatanId
id
name
jenjang
materiMatematika
shapeType
dimensions
formula
correctAnswer
isPlaceholderData
arCheckpointUrl
```

Do not delete these blindly.

During migration:

1. Identify which existing fields remain useful.
2. Introduce new normalized content structures incrementally.
3. Maintain compatibility while existing components still depend on legacy fields.
4. Remove obsolete fields only after all consumers are migrated.

The goal is **migration**, not a destructive rewrite.

---

# 25. SECURITY / ENVIRONMENT

Never commit:

- `.env.local`
- Supabase service-role keys
- private credentials
- API secrets

Frontend Supabase anon/public configuration may be exposed through environment variables as intended by Supabase, but RLS must protect database access.

Never bypass RLS merely to make a demo work.

---

# 26. DEFINITION OF DONE

A feature is not complete merely because the code exists.

For a normal feature:

- implementation exists
- existing behavior is preserved unless intentionally changed
- build/lint passes
- no obvious console errors
- mobile UI has been visually checked
- data is not fabricated
- grade filtering is correct when relevant

For AR:

- all normal checks pass
- fallback exists
- physical Android test is explicitly completed by a human before calling it production-ready

For curriculum/content:

- source material has been supplied
- content is mapped to the correct level
- terminology follows the supplied source
- placeholders are clearly removed/replaced

---

# 27. HISTORICAL ARCHITECTURE — DO NOT REINSTATE AUTOMATICALLY

The previous AGENTS specification described:

```text
Map → Kecamatan → Location → static AR HTML → quiz
```

with strict separation of:

```text
Layer 1: React navigation
Layer 2: React content
Layer 3: separate static AR HTML
```

That architecture was valid for the previous MVP direction but is **not the current product architecture**.

Do not reintroduce the following as mandatory rules:

- AR must be a separate HTML page
- quiz can only appear after AR
- physical location is required for learning
- SD-only content
- four fixed checkpoints as the entire product
- every cultural object maps to exactly one math lesson
- A-Frame/MindAR must remain the only AR implementation

Legacy code may remain temporarily for compatibility, but new work must follow this document.

---

# 28. FINAL PRODUCT PRINCIPLE

When making a product decision, ask:

> **"Does this help a student discover mathematics through Magetan culture, or are we adding technology/complexity merely because it looks impressive?"**

The preferred MageMatika experience is:

```text
MAGETAN CULTURE
      ↓
STUDENT CONTEXT
      ↓
CULTURAL STORY
      ↓
OPTIONAL AR IMMERSION
      ↓
MATHEMATICAL ABSTRACTION
      ↓
MANIPULABLE GEOMETRY
      ↓
OBSERVE + EXPERIMENT
      ↓
DISCOVER
      ↓
SOLVE
      ↓
REWARD
      ↓
PROGRESS
```

**Build the learning experience first. Use AR, maps, R3F, Supabase, and gamification only where they strengthen that experience.**

---

# 29. HUMAN INTERVENTION RULE

> **Always tell the user when direct human intervention is required.**

Examples:

- "AR pipeline is implemented; please test this on an Android device."
- "The final curriculum is still required before this content can be marked final."
- "The cultural measurement is still a placeholder; please provide the field measurement."
- "Supabase production credentials/environment variables must be configured by the project owner."

Never hide uncertainty behind a successful build.
