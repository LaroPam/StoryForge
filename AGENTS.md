# AGENTS.md

## Purpose

This file contains persistent project instructions for AI coding agents working in this repository.

Read this file before making changes. Also read the relevant files in `docs/` and `.agent/PLANS.md` when the task touches product, UX, AI architecture, monetization, or multi-step implementation.

## Project identity

This project is an AI-powered cinematic interactive story adventure platform.

It is **not a chatbot**.

The product is a premium interactive story game where users:

1. Enter a story idea, dream, phrase, mood, or premise.
2. Choose genre, tone, visual style, story length, and difficulty.
3. Create or generate a protagonist.
4. Play through AI-generated story scenes.
5. Make choices or write custom actions.
6. Experience consequences, world memory, inventory, NPC relationships, quests, and endings.
7. Optionally receive generated illustrations for key scenes.

## Product feel

The product should feel like:

- a premium interactive book
- a cinematic visual novel
- an AI game master
- a lightweight RPG
- a story-driven adventure
- atmospheric illustrated fiction

The product must not feel like:

- a raw chatbot
- a generic AI wrapper
- a generic SaaS dashboard
- a basic text generator
- a cheap fantasy template
- a cluttered RPG admin panel

## Required reading by task type

- Product direction: read `docs/PRODUCT_BRIEF.md`
- UX/UI work: read `docs/UX_BLUEPRINT.md`
- Monetization-aware work: read `docs/MONETIZATION.md`
- AI/story engine work: read `docs/AI_ARCHITECTURE.md`
- Phase planning: read `docs/ROADMAP.md`
- Prompt/workflow references: read `docs/PROMPTS.md`
- Complex implementation: use `.agent/PLANS.md`

## Current MVP priority

Build in this order:

1. Project foundation and premium UI system
2. Landing page
3. Story creation wizard
4. Story preview
5. Domain types and mock story engine
6. Adventure scene player
7. Story library
8. Local persistence
9. Database persistence
10. Real AI text integration
11. Image generation pipeline
12. Authentication
13. Payments
14. Export to illustrated book/PDF
15. Creator marketplace

Do not skip ahead.

Real AI, database, authentication, payments, and real image generation are **not part of the first implementation** unless explicitly requested.

## Tech stack

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- Zod

Later:

- Prisma
- PostgreSQL
- Redis
- object storage
- real AI provider
- image generation provider
- billing provider

## Package manager

Detect the package manager from the lockfile.

Prefer `pnpm` if `pnpm-lock.yaml` exists.

Do not switch package managers without explicit instruction.

## UI requirements

The UI must be:

- cinematic
- premium
- dark and atmospheric
- responsive
- readable
- emotionally engaging
- polished
- mobile-first
- accessible where practical

Use:

- large cinematic sections
- soft gradients
- careful spacing
- readable typography
- high-quality empty states
- skeleton loading states
- smooth transitions
- elegant choice buttons
- atmospheric image placeholders

Avoid:

- generic SaaS look
- dashboard-first layout
- raw JSON in user-facing UI
- default browser-looking inputs
- too many icons
- excessive borders
- noisy panels
- childish fantasy styling
- chatbot bubbles as the main UI

## Main gameplay screen requirements

The adventure scene player must include:

- story title
- chapter title
- scene title
- scene progress
- large cinematic scene image area
- readable story text
- 3-5 choices
- custom action input
- loading state for the next scene
- desktop side panel for world/character info
- mobile drawer for world/character info

The world/character panel should include:

- protagonist summary
- health
- will
- danger level
- inventory
- NPC relationships
- active quests
- discovered facts

## Domain model

Use these domain concepts:

- Story
- Character
- Scene
- Choice
- WorldState
- InventoryItem
- NpcRelationship
- Quest
- ImageAsset
- StoryGenre
- StoryTone
- VisualStyle
- StoryDifficulty
- StoryLength
- UserPlan
- CreditBalance
- UsageLimit

## AI architecture

The AI layer must be abstracted behind interfaces.

Create interfaces for:

- StorySeedGenerator
- SceneGenerator
- ActionResolver
- WorldStateUpdater
- ImagePromptGenerator
- ImageGenerator

Start with mock implementations only.

Real providers must be added later behind the same interfaces.

All future real AI responses must be structured and validated with Zod.

## Story engine rules

This is not free-form chat.

The engine should return structured scene data:

- chapterTitle
- sceneTitle
- sceneText
- choices
- imagePrompt
- stateUpdates
- hiddenDirectorNotes

User-facing UI must never show hidden director notes.

The story must preserve:

- continuity
- genre
- tone
- character facts
- inventory
- relationships
- quests
- world rules
- unresolved mysteries

Impossible user actions should not be blindly accepted.

Convert impossible actions into attempts, partial successes, failures, or consequences.

Example:

- User action: `I kill the dragon instantly.`
- Bad result: `The dragon dies.`
- Good result: `The protagonist attempts a reckless attack. The strike only cracks one scale, the dragon notices them, and danger escalates.`

## Monetization-aware design

The MVP must be monetization-ready, but billing must not be implemented in the first phases.

Future monetization concepts:

- free tier
- premium subscription
- credits
- daily turn limits
- image credits
- active story limits
- premium visual styles
- premium memory
- export features
- duo/multiplayer access
- creator worlds

Do not implement billing, checkout, subscriptions, webhooks, or payment providers unless explicitly requested.

Avoid hardcoding unlimited usage into the domain model.

## Development workflow

For each task:

1. Inspect relevant files.
2. Understand the current implementation.
3. Make a small plan for the current phase.
4. Implement only the requested phase.
5. Keep changes scoped.
6. Run relevant checks.
7. Summarize changed files.
8. Explain the next recommended step.

For simple fixes, do not over-plan.

For complex features or refactors, use an ExecPlan as described in `.agent/PLANS.md`.

## Verification

Before considering a task complete, run relevant checks when available:

- lint
- typecheck
- build
- tests, if present

Use the scripts from `package.json` and the detected package manager.

Do not claim checks passed unless they actually ran.

If a script does not exist, say so and recommend adding it.

## Code quality

Use:

- strict TypeScript
- small reusable components
- clear domain types
- readable names
- simple state management
- separation between UI and domain logic
- Zod validation for structured data
- accessible components where practical

Avoid:

- huge components
- magic strings everywhere
- duplicated domain types
- hardcoded provider logic in UI
- unnecessary dependencies
- premature backend complexity
- fake production architecture
- unrelated refactors

## Preferred file organization

```txt
src/
  app/
  components/
    layout/
    marketing/
    story/
    creation/
    ui/
  domain/
    story/
    ai/
  store/
  lib/

docs/
.agent/
```

## Dependency policy

Before adding a new production dependency:

1. Explain why it is needed.
2. Check whether existing dependencies can solve the problem.
3. Keep dependency count low.

## Secrets and security

Never hardcode API keys.

Use environment variables for secrets.

Do not commit `.env.local`.

Do not log secrets.

Do not expose hidden AI prompts, hidden director notes, or provider secrets to the user.

## Communication

Keep updates brief and useful.

Do not narrate every tool call.

When implementing, focus on completing the current phase.

When blocked, explain the blocker and propose the smallest next step.
