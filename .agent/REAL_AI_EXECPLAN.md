# ExecPlan: Phase 9 — Real AI Text Integration (Server-side Provider + Mock Fallback)

## Goal

Integrate real AI text generation behind the existing StoryEngine/provider boundary so the product can generate story text with OpenAI **server-side only**, while preserving current UI behavior and retaining a safe mock fallback.

## Current state

- Next.js App Router app with client Zustand store and stabilized MVP flow (`/create` → `/story/[id]`), with local persistence.
- Store currently depends on `getStoryEngine()` abstraction and not direct mock helper imports.
- `mockStoryEngine` provides all current gameplay logic and remains working baseline.
- Zod schemas exist for key structured outputs (`ActionResolutionResult`, `SceneStateChanges`, `SceneGenerationResult`, etc.).
- No database, auth, payments, or image generation pipeline in this phase.

## Non-goals

- No image generation integration.
- No authentication.
- No payments/credits enforcement logic.
- No database persistence.
- No UI redesign.
- No streaming implementation unless trivial and isolated (out of scope for this phase).

## Product requirements

1. Real AI provider runs on the server only.
2. No API keys in browser bundles.
3. Client Zustand store must not import real OpenAI SDK/provider directly.
4. Existing user flows and UI behavior remain intact.
5. Invalid AI responses are validated/repaired/fallbacked safely.
6. Mock provider remains available and reliable.

## Server/client boundary design

### Boundary principle

- **Client**: collects user input, renders state, calls app-level story actions.
- **Server**: executes real provider calls, prompt assembly, structured parsing, retry/repair, and fallback decisioning.

### Enforced boundary

- OpenAI SDK and provider implementation live in server-only modules and/or Route Handlers.
- Client store calls internal API endpoints (same-origin) and receives validated structured payloads.
- Provider selection (`AI_PROVIDER`) is resolved server-side only.

## API routes vs server actions

### Decision: use Next.js Route Handlers for Phase 9

**Why route handlers now:**
- Current client store action model maps cleanly to imperative fetch requests.
- Avoids tight coupling between client store and server action invocation semantics.
- Easier request/response contracts for retries, fallback metadata, and error handling.
- Keeps transport explicit and testable in browser/network tools.

### Proposed endpoints (Phase 9 text only)

- `POST /api/story/create`
  - Input: `WizardStoryInput`
  - Output: `{ story, firstScene }`

- `POST /api/story/choice`
  - Input: `{ story, choiceId }`
  - Output: `{ story, scene }`

- `POST /api/story/custom-action`
  - Input: `{ story, actionText }`
  - Output: `{ story, scene }`

All endpoints validate inputs/outputs with Zod.

## Provider selection strategy

### Providers

- `mock`: always use `mockStoryEngine`.
- `openai`: prefer OpenAI-backed engine; fallback to mock on provider/validation failure.
- `fallback`: alias behavior that prioritizes real provider but aggressively degrades to mock.

### Runtime strategy

1. Resolve provider from `AI_PROVIDER` on server startup/request.
2. If provider is `mock`, return mock engine result directly.
3. If provider is `openai`/`fallback`, call OpenAI engine path.
4. If OpenAI fails or output invalid after repair attempt, execute mock engine and return safe result.
5. Never expose raw provider errors directly to client UI.

## Environment variables

Required:
- `OPENAI_API_KEY` — secret, server-only.
- `AI_PROVIDER` — `mock | openai | fallback`.
- `AI_MODEL` — default model id for text generation.

Rules:
- Do not reference these via `NEXT_PUBLIC_*`.
- Add server-side env validation helper (Zod) that throws clear startup/runtime config errors.
- In local dev without keys, default to `mock` behavior.

## OpenAI SDK setup

- Add official OpenAI SDK dependency.
- Create server-only provider module (e.g., `src/domain/ai/providers/openai.server.ts`).
- Provider implements same engine interface/contract expected by boundary adapter.
- Keep OpenAI client initialization inside server module only.

## Structured output strategy (Zod + schema-first)

1. Reuse existing domain schemas in `src/domain/ai/schemas.ts` where possible.
2. Add endpoint-level request/response schemas for transport contracts.
3. For OpenAI response format:
   - request structured JSON output matching domain shape,
   - parse response JSON,
   - validate with existing Zod schemas.
4. Convert validation failures into domain-level typed errors for retry/fallback flow.

## Prompt pack / memory pack structure

Create server prompt modules (e.g., `src/domain/ai/prompts/`):

- `system-rules.ts` — immutable product/gameplay constraints.
- `story-context.ts` — genre/tone/protagonist/world summary.
- `turn-context.ts` — recent scenes, selected action/custom action, active quests.
- `output-contract.ts` — required strict JSON shape instructions.

Memory pack policy (phase-appropriate):
- Include: story settings + compact world state + recent scene window (e.g., last 3-5 scenes) + user action.
- Exclude: full unbounded history payload.

## Retry and repair flow for invalid outputs

Per request:
1. Generate with OpenAI.
2. Parse + validate against Zod schemas.
3. If invalid, run **one repair attempt**:
   - resend with concise validation error summary and same context,
   - request corrected JSON output only.
4. Re-validate.
5. If still invalid/failing, fallback to mock engine and return safe response.

Observability:
- Log server-side validation/provider errors (sanitized; no secrets/prompts leaked in client).

## Safe fallback to mock provider

Fallback triggers:
- missing/invalid env config,
- provider/network/API error,
- invalid AI structure after repair,
- timeout threshold exceeded.

Fallback behavior:
- Execute equivalent mock engine path (`createStory`, `resolveChoice`, `resolveCustomAction`).
- Return structurally valid payload expected by client.
- Optionally include non-UI diagnostic flag in server logs only.

## Store changes needed

Current:
- Store calls engine abstraction directly in client runtime.

Phase 9 change:
- Store calls server API endpoints via `fetch` in existing actions:
  - `createStoryFromWizardInput`
  - `chooseAction`
  - `submitCustomAction`

Constraints:
- Keep action signatures and UI behavior unchanged.
- Preserve existing loading/error handling paths.
- Keep hydration/persistence behavior unchanged.
- Do not import OpenAI provider into client modules.

## Files to change (planned)

- `src/app/api/story/create/route.ts` (new)
- `src/app/api/story/choice/route.ts` (new)
- `src/app/api/story/custom-action/route.ts` (new)
- `src/domain/ai/provider.ts` (provider resolver update for server-side mode)
- `src/domain/ai/providers/openai.server.ts` (new)
- `src/domain/ai/providers/mock.server.ts` or adapter (new/optional)
- `src/domain/ai/schemas.ts` (reuse and minor extensions as needed)
- `src/domain/ai/interfaces.ts` (only if minimal additions required)
- `src/domain/ai/prompts/*` (new)
- `src/lib/env/ai.ts` (new server env validation helper)
- `src/store/story-store.ts` (switch from direct engine invocation to API calls)

## Data model changes

- No persistence schema changes.
- No DB changes.
- No auth model changes.
- Reuse existing story/domain types and structured payload shapes.

## UI behavior

- No intentional UI redesign.
- Same pages/components and interaction flow.
- Existing loading/error visuals remain, with potentially improved error messages from server failures.

## Edge cases

- Missing `OPENAI_API_KEY` while `AI_PROVIDER=openai`.
- OpenAI timeout/network failure.
- Malformed JSON from provider.
- Partially valid payloads missing required fields.
- Custom action text too short/invalid.
- Large story state payload (must keep memory pack bounded).

## Verification steps

Automated:
- `npm run lint`
- `npm run build`

Manual:
1. `AI_PROVIDER=mock`: full create/choice/custom-action flow unchanged.
2. `AI_PROVIDER=openai` + valid key/model: real text responses returned and parsed.
3. Force invalid provider output path (test shim) to verify repair + fallback to mock.
4. Remove API key with `AI_PROVIDER=openai` and confirm safe fallback behavior (or explicit server config error if chosen policy).
5. Verify no API key appears in client bundle/network payloads.

## Rollback plan

If Phase 9 is unstable:
1. Set `AI_PROVIDER=mock` as immediate operational rollback.
2. Keep API endpoints but route all logic to mock engine.
3. Revert store-to-API changes only if needed and return to in-client mock boundary.
4. Disable OpenAI provider module path behind feature flag/env guard.

## Implementation checklist

- [ ] Add server env validation for AI variables (`OPENAI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`).
- [ ] Add server-only OpenAI provider module implementing required engine behavior.
- [ ] Add prompt pack modules and bounded memory pack builder.
- [ ] Add route handlers for create/choice/custom-action.
- [ ] Add response/request Zod validation in route handlers.
- [ ] Implement single repair retry on invalid structured output.
- [ ] Implement safe fallback to mock provider on failure.
- [ ] Refactor Zustand store actions to call route handlers.
- [ ] Keep UI behavior and action signatures stable.
- [ ] Validate `mock` provider path remains unchanged.
- [ ] Run lint/build.
- [ ] Execute manual verification matrix (mock/openai/fallback/error paths).

## Progress log

- 2026-04-27: Created ExecPlan for Phase 9 real AI text integration with server-only provider boundary, schema validation, retry/repair, and mock fallback strategy.
