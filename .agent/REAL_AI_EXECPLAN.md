# ExecPlan: Phase 9 — Real AI Text Integration (GenAPI OpenAI-Compatible, Server-side + Mock Fallback)

## Goal

Integrate real AI text generation behind the existing StoryEngine/provider boundary using **GenAPI (OpenAI-compatible)** server-side only, while preserving current UI behavior and retaining a safe mock fallback.

## Current state

- Next.js App Router app with client Zustand store and stabilized MVP flow (`/create` → `/story/[id]`), with local persistence.
- Store depends on StoryEngine abstraction and not direct provider secrets.
- `mockStoryEngine` provides baseline gameplay.
- Zod schemas already validate key structured outputs.
- Server API boundary exists (`/api/story/advance`) and is currently mock-backed.

## Non-goals

- No direct OpenAI integration.
- No image generation.
- No authentication.
- No database persistence.
- No payments.
- No streaming in this phase.
- No UI redesign.

## Product requirements

1. Real provider runs on server only.
2. GenAPI key is never exposed to client code.
3. Client Zustand store only calls internal Next.js API routes.
4. Existing UI behavior remains stable.
5. Invalid provider outputs are parsed/validated/retried/fallbacked safely.
6. Mock provider remains always available.

## Provider naming and selection strategy

### Providers

- `mock`: always use `mockStoryEngine`.
- `genapi`: use GenAPI via OpenAI-compatible HTTP/API client.
- `fallback`: operational behavior where real provider is attempted, then degrades to mock.

### Runtime selection

- Read `AI_PROVIDER` on the server.
- If `mock`, execute mock path.
- If `genapi`, execute GenAPI path.
- If GenAPI fails and `GENAPI_FALLBACK_TO_MOCK=true`, execute mock path.
- If fallback disabled, return safe server error payload.

## Environment variables

Required variables for Phase 9:

- `AI_PROVIDER=mock | genapi`
- `GENAPI_API_KEY`
- `GENAPI_BASE_URL=https://proxy.gen-api.ru/v1`
- `GENAPI_MODEL=gpt-5-4`
- `GENAPI_TIMEOUT_MS`
- `GENAPI_FALLBACK_TO_MOCK=true`

Rules:
- No `NEXT_PUBLIC_*` for secrets.
- Validate env server-side (Zod) before provider calls.
- Do not throw on missing `GENAPI_API_KEY` when `AI_PROVIDER=mock`.
- Throw clear config error when `AI_PROVIDER=genapi` and key is missing.

## Server/client boundary design

### Boundary principle

- **Client**: sends wizard/action inputs to internal API routes and renders returned state.
- **Server**: resolves provider, builds prompts/memory context, calls GenAPI, parses/validates output, runs retry/fallback.

### Enforced constraint

- GenAPI integration modules must be server-only (e.g., `import 'server-only'`).
- Client store must not import GenAPI/OpenAI-compatible SDK directly.
- API key usage is restricted to server route/provider modules.

## API routes vs server actions

### Decision: keep Route Handlers

Continue using route handlers for this phase because:
- they align with current store fetch model,
- request/response contracts stay explicit,
- retry/fallback and diagnostics are easier to encapsulate.

Target route remains (or equivalent split):
- `POST /api/story/advance`
  - start story
  - advance by choice
  - advance by custom action

## GenAPI OpenAI-compatible request strategy

## Transport strategy

Use an OpenAI-compatible **Chat Completions-style** request format first, unless Responses API compatibility is explicitly verified in this codebase.

### Output handling strategy

1. Instruct model: output strict JSON only.
2. Read model output from assistant message content.
3. If output is text-wrapped JSON, safely extract JSON block.
4. Parse JSON.
5. Validate via existing Zod schemas.
6. On parse/validation failure, retry once with stricter JSON-only repair instruction.
7. If still invalid, fallback to mock if enabled.

## Structured output strategy (Zod)

Reuse existing schemas in `src/domain/ai/schemas.ts` for:
- action resolution
- scene state updates
- scene generation result

Add transport-level request/response schemas for API route payloads if needed, keeping route contracts explicit and typed.

## Prompt pack / memory pack strategy

Prompt composition must preserve continuity:

- system rules (story/game constraints)
- story settings (genre, tone, style, protagonist)
- structured world state snapshot
- recent scenes window (bounded)
- selected choice or custom action input
- output contract: strict JSON only

Memory policies:
- include enough recent context for coherence,
- avoid unbounded full-history payloads.

## Retry and repair flow

Per request:
1. Generate once via GenAPI.
2. Attempt parse + Zod validation.
3. If invalid, retry once with stronger JSON-only repair instruction.
4. Re-parse + re-validate.
5. If invalid again, fallback to mock if enabled.

## Error handling matrix

Handle and normalize at server boundary:

- invalid JSON response
- Zod validation failure
- timeout (`GENAPI_TIMEOUT_MS`)
- provider `401/403` (auth/permission)
- insufficient balance/credits
- model not found
- rate limit
- unknown provider error

Response rules:
- return safe client-facing error messages,
- keep sensitive details (keys/internal traces) server-side only.

## Safe fallback behavior

Fallback triggers include:
- env/config problems (when allowed),
- timeout/network/provider errors,
- invalid structure after retry,
- provider limits/balance/model errors.

When `GENAPI_FALLBACK_TO_MOCK=true`:
- run mock engine equivalent path,
- return normal story payload shape expected by client.

When fallback disabled:
- return controlled error without leaking internals.

## Store impact (Phase 9)

Store behavior target:
- call internal API route(s) only,
- keep existing action signatures and UI loading/error behavior,
- do not import or initialize GenAPI client in client code.

## Planned files (Phase 9 implementation)

- `src/domain/ai/server-config.ts` (extend for GenAPI envs)
- `src/domain/ai/server-engine.ts` (provider switch mock/genapi/fallback)
- `src/domain/ai/providers/genapi.server.ts` (new)
- `src/domain/ai/prompts/*` (new prompt/memory pack modules)
- `src/app/api/story/advance/route.ts` (route integration + robust error mapping)
- `src/store/story-store.ts` (route-call wiring; no provider secrets)
- optional: `src/lib/server/json.ts` for safe JSON extraction/parsing utility

## Verification steps

Automated:
- `npm run lint`
- `npm run build`

Manual:
1. `AI_PROVIDER=mock` still works end-to-end.
2. `AI_PROVIDER=genapi` with valid key/model returns structured scenes.
3. Force malformed JSON to verify one retry then fallback.
4. Simulate timeout and verify fallback/error behavior.
5. Simulate 401/403, insufficient balance, model-not-found, and rate-limit responses.
6. Verify no GenAPI key appears in browser bundle or client network payloads beyond server route calls.

## Rollback plan

If rollout is unstable:
1. Set `AI_PROVIDER=mock`.
2. Keep route contracts stable but force mock path in server-engine.
3. Disable GenAPI provider module path behind config flag.
4. Revisit retry/error mapping without UI changes.

## Implementation checklist

- [ ] Update env schema and defaults for GenAPI variables.
- [ ] Add server-only GenAPI provider module (OpenAI-compatible chat completions format).
- [ ] Add safe JSON extraction/parser utility for text-wrapped JSON.
- [ ] Implement parse → validate → retry-once repair flow.
- [ ] Implement fallback-to-mock toggle behavior.
- [ ] Add explicit error mapping for listed provider failure classes.
- [ ] Keep `/api/story/advance` response shape stable for store.
- [ ] Wire/verify client store route usage only (no direct provider imports).
- [ ] Run lint/build and manual scenario matrix.

## Progress log

- 2026-04-27: Reworked ExecPlan from direct OpenAI integration to GenAPI OpenAI-compatible server-side integration with provider names `mock | genapi | fallback`, env contract, JSON parsing/repair, and fallback strategy.
