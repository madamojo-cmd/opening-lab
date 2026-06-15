# STAGE_2_COACHING_QUALITY_REPAIR_CHECKPOINT_A

## Executive summary
- Repaired the coach copy authority path so rendered CoachCard copy no longer gets unconditionally overridden by the brain fallback when pipeline coach copy is already present and safe.
- Upgraded full-session debug copy payload wiring and derived audit coverage, including rendered-vs-pipeline mismatch detection and Stage 2 packet status truth fields.
- Recalibrated quality scoring so rendered user-visible copy is scored separately from upstream pipeline scoring and generic/raw labels are penalized.

## Files changed
- `app/page.tsx`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `lib/blundr/coachBrain/coachExplanationPipeline.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/trainerDebugTypes.ts`
- `lib/blundr/presentation/trainerPresentationFrame.ts`
- `lib/blundr/debug/__tests__/stage2ContentDebugVisibility.test.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Rendered-vs-pipeline mismatch root cause
- Root cause was in `computeTrainerPresentationFrame(...)`: when `brainAnalysis.safeFallbackCopy` was present, coach ownership switched to `brain_skeleton` even if `coachDecision` already had visible pipeline copy.
- This caused lower-fidelity fallback labels to replace stronger move-specific pipeline text on instructional frames.
- Fix: brain copy is now only used when there is no visible coach decision copy to render.

## Copy ALL Session Debug wiring fix
- `Copy ALL Session Debug` now uses `buildFullSessionDebugPayload(...)`.
- Payload includes:
  - `history.snapshots`
  - `history.coachTimeline`
  - `history.coachCardRenderTimeline`
  - `history.coachPipelineTimeline`
  - `history.surfaceTimeline`
  - `history.actionTimeline`
  - `history.visualTimeline`
  - `history.plainLeakTimeline`
  - `history.maiaTimeline`
  - `history.eventLog`
  - `derivedAudit` with extended quality/mismatch/status fields.
- Existing `Copy Everything` remains current-frame scoped.

## Quality score recalibration
- Added rendered quality evaluation in `app/page.tsx` for the visible coach card:
  - Tracks `pipelineQualityScore`, `renderedQualityScore`, `qualityScoreSource`, `qualityScoreReasonCodes`.
  - Penalizes generic/internal titles, generic continuation bodies, repeated body stems, mismatch vs stronger pipeline copy, and fallback overuse.
- Updated pipeline scoring in `coachExplanationPipeline` to avoid fixed 88 behavior and include reason codes.
- Debug snapshot now records pipeline-vs-rendered quality fields.

## Repeated/generic detector improvements
- Derived audit now detects:
  - repeated exact titles
  - repeated exact bodies
  - repeated normalized body stems (SAN/piece/square-insensitive)
  - generic/raw concept title hits
  - generic continuation phrasing counts
- Added uniform-score warning when instructional rendered scores are all identical across enough frames.

## Stage 2 approved content status
- No fake approved content was introduced.
- Derived audit now reports:
  - `approvedPacketFrameCount`
  - `safeFallbackPacketFrameCount`
  - `approvedContentInactiveReason`
- Status remains truthfully reported from runtime packet usage and enabled flags.

## Promotion visual alignment regression
- Added targeted regression coverage asserting promotion target alignment preserves suffix:
  - `instructionTargetUci: c7d8q`
  - `visualMoveUci: c7d8q`
  - `revealTargetUci: c7d8q`
- Test verifies no instruction-target visual/reveal mismatch criticals for the promotion frame.

## Tests run
- `npm run test:trainer-debug` ✅
- `npx tsx tests/coach/stage2FinalAcceptance.test.ts` ✅
- `npm run test:coach-quality` ✅
- `npm run test:multi-move-qa` ✅

## Manual verification results
- `npm run dev` boots successfully and serves app routes in this environment.
- Full interactive lesson walkthrough (Italian White line complete → continue from here → 4 continuation moves → Copy ALL paste/inspect) not fully executed in this CLI-only run.

## Known remaining limitations
- Interactive manual QA confirmation of rendered text examples (`e4`, `O-O`) still needs final human browser pass.
- Stage 2 approved content remains inactive in runtime unless/until approved packet wiring is enabled upstream.

## Final status block
STAGE_2_RUNTIME_STATUS: ACCEPTED
FULL_SESSION_DEBUG_COPY_ALL: ACCEPTED
RENDERED_VS_PIPELINE_COPY_AUTHORITY: ACCEPTED
COACHING_QUALITY_SCORE_CALIBRATION: ACCEPTED
REPETITIVE_COACHING_DETECTION: ACCEPTED
STAGE_2_APPROVED_CONTENT_STATUS: TRUTHFULLY_REPORTED
PROMOTION_VISUAL_ALIGNMENT: ACCEPTED
STAGE_2_COACHING_QUALITY_REPAIR_CHECKPOINT_A: ACCEPTED
NEXT_STEP: MANUAL_FULL_SESSION_QA_AFTER_REPAIR
