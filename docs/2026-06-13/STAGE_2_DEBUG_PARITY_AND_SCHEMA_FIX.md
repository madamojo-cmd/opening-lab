# Stage 2 Debug Parity And Schema Fix

## Scope

- Align debug-visible CoachCard copy with final rendered CoachCard authority.
- Preserve pre-authority surface copy as debug-only context.
- Keep Copy ALL Session Debug schema complete for session-level audit.
- Do not change move authority, runtime-book authority, coaching selection, Plain View reveal behavior, or Stage 2 content activation.

## Debug Parity Fix

- `visibleTitle` and `visibleBody` now represent the final user-visible CoachCard copy when the v28 surface owner is active.
- `actualCoachCardTitle` and `actualCoachCardBody` remain the rendered authority.
- Pipeline copy remains separately visible in pipeline timeline/debug fields.
- Stale v28 surface candidates move to:
  - `preAuthoritySurfaceTitle`
  - `preAuthoritySurfaceBody`
  - `preAuthoritySurfaceOwner`
  - `preAuthoritySurfaceReason`

## Copy ALL Schema

- `buildFullSessionDebugPayload` exposes:
  - `history`
  - `history.snapshots`
  - `history.coachCardRenderTimeline`
  - `history.coachPipelineTimeline`
  - `history.visualTimeline`
  - `history.actionTimeline`
  - `history.surfaceModeTransitionTimeline`
  - `history.plainLeakTimeline`
  - `history.maiaTimeline`
  - `history.eventLog`
  - `derivedAudit`
- `derivedAudit` now also includes:
  - `restrictedLineExhaustedFrames`
  - `pendingOpponentRequestStallFrames`

## Audit Semantics

- Rendered-vs-pipeline mismatch checks use final rendered/visible authority.
- Pre-authority surface copy is retained for diagnosis but does not count as learner-facing mismatch.
- Raw concept label checks remain focused on final user-visible copy.

## Tests

- `npm run test:trainer-debug` -> pass
- `npx tsx lib/blundr/presentation/__tests__/renderedCoachCopyAuthority.test.ts` -> pass
- `npx tsx tests/coach/stage2FinalAcceptance.test.ts` -> pass

DEBUG_VISIBLE_ACTUAL_PARITY: ACCEPTED
FULL_SESSION_DEBUG_COPY_ALL_SCHEMA: ACCEPTED
ACTUAL_RENDERED_COACH_COPY_AUTHORITY: ACCEPTED
