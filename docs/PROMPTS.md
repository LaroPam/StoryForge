# Prompts for Codex / Claude Code

Use these prompts in the coding agent chat.

Do not paste the entire documentation every time. Keep persistent instructions in the repository and send only the current phase prompt.

## Global short instruction for coding agent settings

Use this in global/user instructions if the tool supports it:

```txt
Always work incrementally.

Before making significant changes:
1. Inspect the repository.
2. Summarize the current state.
3. Propose a small implementation plan.
4. Implement only the requested scope.
5. Run available checks.
6. Summarize changed files.

Do not implement future phases unless explicitly requested.
Do not add unnecessary dependencies.
Prefer simple, maintainable TypeScript code.
When a repository contains AGENTS.md, follow it as the main project instruction.
```

## Phase 0 + Phase 1 prompt

```txt
Read AGENTS.md, CLAUDE.md if available, docs/PRODUCT_BRIEF.md, docs/UX_BLUEPRINT.md, docs/MONETIZATION.md, docs/AI_ARCHITECTURE.md, docs/ROADMAP.md, and .agent/PLANS.md before making changes.

We are building an AI-powered cinematic interactive story adventure platform.

This is not a chatbot.

Current task: Phase 0 and Phase 1 only.

Phase 0:
Inspect the repository and summarize:
1. Current framework and dependencies.
2. Current file structure.
3. Existing scripts.
4. Whether TypeScript, Tailwind, ESLint, App Router, and src directory are configured.
5. Any missing setup needed before implementation.

Phase 1:
Create the initial project structure and UI foundation.

Implement:
1. Clean base layout.
2. Global dark cinematic theme.
3. Reusable layout components if needed.
4. Basic design tokens through Tailwind/CSS variables where appropriate.
5. Placeholder directories:
   - components/layout
   - components/marketing
   - components/story
   - components/creation
   - domain/story
   - domain/ai
   - store
6. Basic utility files if missing.
7. Ensure the app still runs.

Do not implement landing page yet.
Do not implement story wizard yet.
Do not implement story engine yet.
Do not implement real AI.
Do not implement database.
Do not implement auth.
Do not implement payments.

After implementation:
- run available lint/typecheck/build checks
- summarize changed files
- explain the next recommended phase
```

## Phase 2 prompt — Landing page

```txt
Implement Phase 2: premium cinematic landing page.

Read AGENTS.md and docs/PRODUCT_BRIEF.md before making changes.

Goal:
Create a premium landing page for the AI interactive story adventure platform.

The page must instantly communicate:
"Write one idea and enter a living illustrated adventure with choices, consequences, memory, and endings."

Route:
/

Sections:

1. Hero
- cinematic dark background
- emotional headline
- strong subtitle
- primary CTA: Start adventure
- secondary CTA: View demo
- premium mockup of the story player

2. How it works
- Enter an idea
- Choose style
- Create hero
- Play the story

3. Genre showcase
Cards:
- Dark Fantasy
- Mystic Detective
- Space Odyssey
- Horror
- Romance
- Cyberpunk

4. Features
- AI-generated scene illustrations
- Choices and consequences
- Persistent world memory
- Inventory and quests
- NPC relationships
- Multiple endings

5. Scene gallery teaser
Use atmospheric placeholder scene cards.

6. Final CTA

Design requirements:
- premium
- cinematic
- dark
- atmospheric
- responsive
- polished
- not generic SaaS
- not chatbot-like
- not cluttered

Use mock content.
Use reusable components.
Do not add auth.
Do not add real AI.
Do not add payments.
Do not add database.

After implementation:
- run available checks
- summarize changed files
- suggest next phase
```

## Phase 3 prompt — Story creation wizard

```txt
Implement Phase 3: story creation wizard.

Route:
/create

Goal:
Create a beautiful multi-step story creation flow.

The wizard should feel like creating a personal cinematic adventure, not filling out a boring form.

Steps:

1. Story idea
User enters a premise, dream, thought, phrase, or beginning of a story.
Show prompt chips:
- A city where people lose their shadows
- A train crossing a dead world
- A girl receives a letter from her future self
- A magic academy where magic is forbidden
- A detective who can hear ghosts

2. Genre
Options:
- Dark Fantasy
- Mystic Detective
- Space Odyssey
- Horror
- Romance
- Cyberpunk
- Post-apocalyptic
- Urban Fantasy

3. Tone
Options:
- Cinematic
- Dark
- Cozy
- Epic
- Mysterious
- Brutal
- Fairy-tale
- Anime-inspired

4. Visual style
Options:
- Cinematic realism
- Premium fantasy illustration
- Dark gothic
- Anime fantasy
- Watercolor dream
- Retro sci-fi

5. Character
Allow two modes:
- Generate character
- Manual character

Manual fields:
- name
- role
- strength
- weakness
- secret
- goal
- starting item

6. Story settings
Length:
- short adventure
- medium story
- long campaign

Difficulty:
- easy
- normal
- dangerous
- hardcore

7. Preview step
Show mock generated:
- title
- synopsis
- protagonist
- genre
- tone
- visual style
- difficulty
- start button

Requirements:
- use typed wizard state
- validate required fields
- smooth step transitions
- responsive layout
- premium UI
- no real AI
- no database
- no authentication
- mock preview generation only

After implementation:
- run available checks
- summarize changed files
- suggest next phase
```

## Phase 4 prompt — Domain types and mock story engine

```txt
Implement Phase 4: domain types and mock story engine.

Goal:
Create a typed domain model and a mock playable story engine.

Create or update files under:

src/domain/story/
src/domain/ai/

Required domain types:

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

Required AI/game interfaces:

- StorySeedGenerator
- SceneGenerator
- ActionResolver
- WorldStateUpdater
- ImagePromptGenerator
- ImageGenerator

Required mock implementations:

- mockStorySeedGenerator
- mockSceneGenerator
- mockActionResolver
- mockWorldStateUpdater
- mockImagePromptGenerator
- mockImageGenerator

The mock engine must support:

1. Creating a story from wizard input.
2. Generating the first scene.
3. Resolving a selected choice.
4. Resolving a custom action.
5. Generating the next scene.
6. Updating world state:
   - danger level
   - inventory
   - relationships
   - quests
   - discovered facts
7. Returning an image prompt for each scene.

Scene must include:

- id
- storyId
- chapterNumber
- chapterTitle
- sceneTitle
- sceneText
- choices
- imagePrompt
- imageUrl or placeholder
- createdAt
- stateChanges

Choice must include:

- id
- label
- intent
- riskLevel
- requiredCheck optional
- consequenceHint optional

Important:
This is not a chat.
The output must be structured scene data.
Keep implementation simple but extensible.
Do not integrate real AI yet.
Do not add database yet.

After implementation:
- run available checks
- summarize changed files
- explain how the mock engine works
```

## Phase 5 prompt — Adventure scene player

```txt
Implement Phase 5: adventure scene player.

Route:
/story/[id]

Goal:
Create the main gameplay screen using the mock story engine.

The screen must include:

1. Header
- story title
- chapter title
- scene progress
- button to open world/character panel

2. Scene image area
- large cinematic image placeholder
- future support for generated image URL
- atmospheric gradient overlay
- skeleton/loading state

3. Scene text
- premium readable typography
- good line height
- comfortable width

4. Choices
- 3-5 choice buttons
- each choice can show:
  - risk
  - consequence hint
  - skill/check indicator
- clicking a choice advances the mock story

5. Custom action
- input or textarea: "Describe your own action..."
- submit button
- advances story through mock action resolver

6. World side panel

Desktop:
- right panel

Mobile:
- bottom drawer/sheet

Panel content:
- character summary
- health
- will
- danger
- inventory
- NPC relationships
- active quests
- discovered facts

7. Loading state

When generating next scene:
- disable choices
- keep current scene visible
- show cinematic loading text
- avoid boring spinner-only UI

Requirements:
- use mock story engine
- use local/Zustand state if already set up
- no real AI
- no database
- no authentication
- no payments
- responsive
- polished
- not chatbot-like
- no raw JSON visible to user

After implementation:
- run available checks
- summarize changed files
- suggest next phase
```

## Real AI integration prompt — later only

```txt
Implement real AI provider integration behind existing interfaces.

Do not change UI behavior.
Do not remove mock provider.
Add provider abstraction so the app can switch between:
- mock
- real text provider
- future provider

Requirements:

- All AI outputs must be structured data.
- Validate AI responses with Zod.
- If AI response is invalid, retry once with a repair prompt.
- If still invalid, fall back to a safe mock response.
- Never expose hidden director notes to the user.
- Store both visible scene text and structured state updates.
- Keep prompts in separate files or modules.
- Add environment variable checks.
- Do not hardcode API keys.

Action resolver must:
- reject impossible god-mode actions
- convert impossible actions into attempts
- preserve story logic
- allow partial success
- allow failure
- update risk and consequences

Requires an ExecPlan.
```
