# Stage 2 Coaching Quality Repair Checkpoint B

## Executive verdict

Checkpoint B implemented both required fixes:

- Final rendered CoachCard copy now prefers safe, aligned pipeline copy for instructional user-turn frames at the final render seam.
- Copy ALL Session Debug now exposes the required full-session `history` and `derivedAudit` schema fields (including pipeline/rendered score distributions and mismatch analytics).

## Files changed

- `app/page.tsx`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `lib/blundr/debug/__tests__/stage2ContentDebugVisibility.test.ts`
- `lib/blundr/debug/testTrainerDebug.ts`
- `lib/blundr/presentation/renderedCoachCopyAuthority.ts`
- `lib/blundr/presentation/__tests__/renderedCoachCopyAuthority.test.ts`

## Root cause of rendered-vs-pipeline mismatch

The final card was materialized from `surfaceCoachCardDecision` using `v28CoachUiModel` / visible-surface copy, while stronger pipeline copy (`displayedCoachDecision.title/body`) existed but was not authoritative at the final seam.

Result: rendered copy could remain generic/raw even when pipeline copy was specific and safe.

## Final CoachCard authority fix

A dedicated authority selector (`selectRenderedCoachCardCopyAuthority`) was added and wired immediately before Stage 2 enrichment and `surfaceCoachCardDecision` materialization.

For instructional user-turn frames, pipeline copy is now preferred only when all are true:

- pipeline title/body exist
- pipeline target-aligned
- pipeline piece-aligned
- no debug leak
- pipeline safety passed
- surface safety not blocked
- not plain pre-show-more (preserves no-leak gate)

If rejected, debug metadata records:

- `pipelineCopyRejected`
- `pipelineCopyRejectedReason`
- `renderedCopyAuthority`
- `pipelineCopyAuthority`

No move/candidate authority paths were changed.

## Copy ALL full schema fix

`Copy ALL Session Debug` uses `buildFullSessionDebugPayload`, which now includes required full-session shape and naming:

- top-level `history`
- top-level `derivedAudit`
- `history.surfaceModeTransitionTimeline` (with compatibility alias `surfaceTimeline`)
- `derivedAudit.pipelineQualityScoreDistribution`
- `derivedAudit.renderedQualityScoreDistribution`
- existing required arrays/metrics retained (`renderedVsPipelineCopyMismatches`, `stage2PacketUsage`, `featureExposureGaps`, etc.)

## Scoring behavior after fix

Rendered scoring remains final-authority (`qualityScoreSource: rendered_coach_card`) and mismatch penalties remain active.

- When rendered copy diverges from better pipeline copy, mismatch reasons continue to penalize score.
- When rendered copy follows safe pipeline copy, mismatch penalties drop and rendered score can recover.

## Tests run

- `npm run test:trainer-debug` -> pass
- `npx tsx tests/coach/stage2FinalAcceptance.test.ts` -> pass
- `npm run test:coach-quality` -> pass
- `npm run test:multi-move-qa` -> pass

Additional coverage added:

- `renderedCoachCopyAuthority` unit tests for:
  - pipeline precedence on instructional frames
  - generic surface override prevention (`e4`, `O-O`, `Qh8#` cases)
  - plain pre-show-more rejection
  - debug-leak rejection
- Stage 2 debug visibility tests updated for required `history`/`derivedAudit` schema fields.

## Manual QA result

- `npm run dev` executed.
- `/` responded `HTTP 200` (no 500 load failure).
- Full interactive move-sequence walkthrough was not executed in this shell-only run.

## Remaining known limitations

- Stage 2 approved content remains inactive/truthfully reported in this scope.
- Full-session interactive manual QA for specific Italian continuation sequence remains the next explicit validation pass.

## Final status block

STAGE_2_RUNTIME_STATUS: ACCEPTED
QUALITY_SCORE_VISIBILITY: ACCEPTED
RENDERED_SCORE_CALIBRATION: ACCEPTED
RENDERED_VS_PIPELINE_DETECTION: ACCEPTED
RENDERED_COACH_COPY_AUTHORITY: ACCEPTED
FULL_SESSION_DEBUG_COPY_ALL_SCHEMA: ACCEPTED
STAGE_2_APPROVED_CONTENT_STATUS: INACTIVE_TRUTHFULLY_REPORTED
STAGE_2_COACHING_QUALITY_REPAIR_CHECKPOINT_B: ACCEPTED
NEXT_STEP: MANUAL_FULL_SESSION_QA_AFTER_CHECKPOINT_B
