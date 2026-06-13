# Stage 2 D.7 Stage 2 Coaching Packet Resolver Shell

## Scope

- D.7 infrastructure shell only.
- No runtime book candidate authority changes.
- No move selection changes.
- No target override behavior.
- No Stage 2 markdown/sample content imports.
- No visual recipe rendering from Stage 2 coaching.
- No annotation factory implementation.

## Files Changed

- `lib/blundr/stage2Coaching/stage2CoachingTypes.ts`
- `lib/blundr/stage2Coaching/stage2CoachingFlags.ts`
- `lib/blundr/stage2Coaching/buildStage2CoachContext.ts`
- `lib/blundr/stage2Coaching/buildSafeStage2FallbackPacket.ts`
- `lib/blundr/stage2Coaching/resolveStage2CoachingPacket.ts`
- `lib/blundr/stage2Coaching/index.ts`
- `app/page.tsx`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `tests/coach/stage2CoachingResolverShell.test.ts`

## Seam Chosen

- Chosen seam: post-`CurrentInstructionFrame.target` data path in `app/page.tsx`, directly before diagnostics snapshot assembly.
- Resolver input uses already-selected target and runtime-book frame context.
- Resolver output is currently debug-only (no learner-facing rendering swap).

## Wiring Outcome

- UI wiring status: **resolver shell wired, debug-only exposure**.
- No CoachCard copy replacement was applied in D.7.
- Existing CoachCard behavior remains unchanged when resolver returns `none` or `safe_fallback`.

## Feature Flags Added

- `STAGE2_COACHING_RESOLVER_ENABLED = true`
- `STAGE2_APPROVED_CONTENT_ENABLED = false`
- `STAGE2_SAFE_FALLBACK_ENABLED = true`

## Fallback Behavior

- Resolver API:
  - `{ kind: "approved_packet"; packet }`
  - `{ kind: "safe_fallback"; packet }`
  - `{ kind: "none"; reason }`
- With approved content disabled, resolver does not emit approved packets.
- Safe fallback packet is conservative:
  - title: `Book move`
  - body/hint are generic and non-claim-heavy
  - show-more may include runtime rank/game stats
  - no visual recipes attached

## Plain View No-Leak Confirmation

- Hidden/hint states do not expose target SAN/UCI in fallback body/hint strings.
- Fallback still keeps `moveUci`/`moveSan` in packet metadata for alignment/debug, not for early plain reveal copy.

## No-Content-Import Confirmation

- Resolver shell modules do not import:
  - `docs/content/stage2/`
  - `imports/stage2-sample/`
  - markdown content files
- Resolver behavior does not require canonical content source presence in D.7.

## No-Visual-Render Confirmation

- Resolver shell emits `visualRecipeRefs: []`.
- No Stage 2 visual systems are rendered or attached to board visuals.

## Target Authority Confirmation

- Resolver consumes already-selected target context only.
- Resolver does not select or mutate move authority.
- Runtime-book and continuation/Stockfish authority remains unchanged.

## Debug Visibility Added

- Added debug fields in continuation snapshot/copy payload:
  - `stage2CoachingResolverEnabled`
  - `stage2ApprovedContentEnabled`
  - `stage2SafeFallbackEnabled`
  - `stage2CoachingPacketKind`
  - `stage2CoachingSafetyStatus`
  - `stage2CoachingSurface`
  - `stage2CoachingSourceFile`
  - `stage2CoachingRuntimeMatched`

## Tests Run

- `npm run test:coach-quality` -> pass
- `npm run test:trainer-debug` -> pass
- `npm run test:multi-move-qa` -> pass
- `npx tsx tests/coach/runtimeBookBeforeContinuation.test.ts` -> pass
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts` -> pass
- `npx tsx tests/coach/runtimeBookNoCopyOrVisualIntegration.test.ts` -> pass
- `npx tsx tests/content/stage2Final21CoachingContentAcceptance.test.ts` -> pass
- `npx tsx tests/coach/stage2CoachingResolverShell.test.ts` -> pass (required unsandboxed rerun after sandbox EPERM)

## Pass/Fail Summary

- Resolver shell infrastructure: pass
- Debug visibility: pass
- Candidate authority regression checks: pass
- Plain-view leak guard checks: pass
- No-content-import guard checks: pass

## Next Recommended Step

- D.8 canonical content source stabilization execution.

D7_STAGE_2_COACHING_PACKET_RESOLVER_SHELL_STATUS: ACCEPTED
