# Roadmap

## Build philosophy

Build the product in small phases.

Each phase should be independently reviewable and should not implement future phases early.

Commit after each completed phase.

## Phase 0 — Repository audit

Goal:

Understand current project setup.

Tasks:

- inspect framework and dependencies
- inspect file structure
- inspect scripts
- confirm TypeScript, Tailwind, ESLint, App Router, and `src/` configuration
- identify missing setup

Output:

- short repository summary
- implementation plan for Phase 1

## Phase 1 — Foundation

Goal:

Create the project structure and premium UI foundation.

Tasks:

- clean base layout
- global dark cinematic theme
- design tokens/CSS variables where appropriate
- placeholder directories
- basic utilities
- ensure app runs

Do not implement landing page yet.

## Phase 2 — Landing page

Goal:

Create a premium cinematic landing page.

Sections:

- hero
- how it works
- genre showcase
- features
- scene gallery teaser
- final CTA

Do not implement story wizard yet.

## Phase 3 — Story creation wizard

Goal:

Create a multi-step wizard.

Steps:

- story idea
- genre
- tone
- visual style
- character
- length/difficulty
- preview

Use mock preview generation only.

## Phase 4 — Domain types and mock engine

Goal:

Create typed domain model and playable mock story loop.

Tasks:

- domain types
- AI interfaces
- mock implementations
- basic engine functions

No real AI.

## Phase 5 — Adventure scene player

Goal:

Create the main gameplay screen.

Tasks:

- scene image area
- story text
- choices
- custom action
- world panel
- mobile drawer
- loading state
- advance story through mock engine

## Phase 6 — Story library

Goal:

Show user stories and progress.

Tasks:

- story cards
- active/completed/draft states
- continue story action
- empty states

## Phase 7 — Local persistence

Goal:

Persist MVP stories locally.

Options:

- localStorage
- IndexedDB if needed

No backend database yet unless explicitly requested.

## Phase 8 — Database persistence

Goal:

Add real persistence.

Likely stack:

- Prisma
- PostgreSQL

Requires an ExecPlan.

## Phase 9 — Real AI text integration

Goal:

Implement real AI providers behind existing interfaces.

Requirements:

- structured outputs
- Zod validation
- retry/repair on invalid output
- fallback to mock provider
- environment variables for secrets

Requires an ExecPlan.

## Phase 10 — Image generation pipeline

Goal:

Add image prompt pipeline and provider abstraction.

Requirements:

- scene image requests
- placeholder state
- loading state
- failure fallback
- future consistency through VisualBible

Requires an ExecPlan.

## Phase 11 — Authentication

Goal:

Add accounts only after core loop works.

Requires an ExecPlan.

## Phase 12 — Payments and credits

Goal:

Add monetization only after retention is proven.

Requires an ExecPlan.

## Phase 13 — Export

Goal:

Export finished stories to PDF/EPUB or illustrated book.

Requires an ExecPlan.

## Phase 14 — Creator marketplace

Goal:

Let creators build and publish worlds.

Not part of MVP.
