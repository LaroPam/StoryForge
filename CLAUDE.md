# CLAUDE.md

Read `AGENTS.md` first. It is the primary project instruction file.

This project is an AI-powered cinematic interactive story adventure platform, not a chatbot.

## Claude Code behavior

Follow these rules:

1. Keep work scoped to the current requested phase.
2. Do not implement future phases early.
3. Do not add authentication, payments, database persistence, real AI, or real image generation until explicitly requested.
4. Start with mock AI and a working mock story loop.
5. Prioritize premium UI and gameplay feel before backend complexity.
6. Use concise progress updates.
7. Run checks after changes when possible.
8. Explain changed files after implementation.

## Planning

For small tasks:

- inspect files
- implement directly
- verify
- summarize

For large features:

- create or update an ExecPlan using `.agent/PLANS.md`
- keep the plan concrete
- implement phase by phase
- update the progress log

## Important product constraint

Never turn the product into a chat interface.

The core UI is a cinematic scene reader with:

- scene image
- story text
- choices
- custom action input
- character/world side panel
- consequences

## Current preferred implementation order

1. UI foundation
2. Landing page
3. Story creation wizard
4. Story preview
5. Domain types
6. Mock story engine
7. Scene player
8. Story library
9. Local persistence
10. Database persistence
11. Real AI
12. Image generation
13. Authentication
14. Payments
15. Export and creator marketplace

## Quality bar

The result must feel polished, premium, and intentional.

Avoid generic dashboard layouts, default-looking components, and chatbot-first interaction patterns.
