# Execution Plans

Use an ExecPlan for complex features, significant refactors, or multi-step changes.

An ExecPlan is a living implementation document. It must be understandable to someone who only has the current repository and this plan.

## When to use an ExecPlan

Use an ExecPlan for:

- story engine architecture
- AI provider integration
- image generation pipeline
- database schema and persistence
- authentication
- payments
- large UI flows
- major refactors
- export system
- creator marketplace

Do not use an ExecPlan for:

- small UI fixes
- copy changes
- simple component extraction
- small bug fixes

## Required sections

Every ExecPlan must contain:

1. Goal
2. Current state
3. Non-goals
4. Product requirements
5. Technical design
6. Files to change
7. Data model changes
8. UI behavior
9. Edge cases
10. Verification steps
11. Rollback plan
12. Implementation checklist
13. Progress log

## Rules

- Keep the plan concrete.
- Avoid vague tasks like `improve UI`.
- Every checklist item must be verifiable.
- Update the progress log after meaningful implementation steps.
- Do not mark a task complete unless it was implemented and checked.
- Keep the implementation incremental.
- Do not implement future phases early.

## ExecPlan template

```md
# ExecPlan: <feature name>

## Goal

What this plan will accomplish.

## Current state

What exists now in the repository.

## Non-goals

What this plan explicitly will not do.

## Product requirements

User-facing requirements and expected behavior.

## Technical design

Architecture, data flow, state management, and important decisions.

## Files to change

List of files that will likely be created or modified.

## Data model changes

Types, schemas, storage, or persistence changes.

## UI behavior

Screens, interactions, loading states, empty states, and responsive behavior.

## Edge cases

Important failure states and boundary cases.

## Verification steps

Commands and manual checks.

## Rollback plan

How to revert if something goes wrong.

## Implementation checklist

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Progress log

- YYYY-MM-DD: Created plan.
```
