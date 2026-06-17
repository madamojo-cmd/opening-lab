# Stage 2 Visual Recipe Traceability Inventory

## Scope

- Trace the final visual chain from approval/reconciliation into the rendered frame.
- No move authority changes.
- No continuation changes.
- No branch-complete changes.
- No Stage 2 content activation changes.

## Visual source hierarchy

Normalized authority order for final visual reporting:

1. `approved_recipe`
2. `generated_recipe`
3. `fallback_current_surface`
4. `none`

The normalized result is captured in `TrainerFrameResolution.visualResult`, then surfaced in:

- `FeatureTrace.visualResult`
- `TrainerDebugSnapshot.visualResult`
- Diagnostics panel Copy Everything payload

## Final visual contract

The visual trace must report:

- `rendered`
- `visualSource`
- `finalVisualTargetUci`
- `finalVisualTargetSan`
- `approvedRecipeMatched`
- `approvedRecipeId`
- `approvedRecipeTargetMoveUci`
- `generatedRecipeRendered`
- `fallbackSurfaceVisualsRendered`
- `primitiveCount`
- `sourceSquare`
- `destinationSquare`
- `targetMatchesInstruction`
- `targetMatchesCoachCard`
- `plainViewSuppressed`
- `castlingNormalized`
- `sourceRuntimeMoveUci`
- `missingReasons`
- `warnings`

## Where the truth now flows

- `app/page.tsx`
  - passes the runtime packet source move into frame resolution when it exists
  - keeps coach/continuation/branch-complete behavior unchanged
- `lib/blundr/debug/buildTrainerFrameResolution.ts`
  - derives the final normalized visual result
- `lib/blundr/debug/buildStage2FeatureTrace.ts`
  - exposes the visual result in feature tracing
- `lib/blundr/debug/trainerDebugSnapshot.ts`
  - records the visual result for QA snapshots
- `components/debug/BlundrDiagnosticsPanel.tsx`
  - includes the visual result in Copy Everything and snapshot history

## Current inventory status

- Approved recipe rendering is traceable.
- Generated recipe rendering is traceable.
- Fallback current-surface rendering is traceable.
- No-visual states are traceable.
- Castling normalization is traceable through `sourceRuntimeMoveUci` and normalized target fields.
- Plain View suppression is traceable without leaking the target.

## Known limitations

- The visual result is descriptive only and does not select moves.
- The normalized visual source is still gated by the existing app/runtime flow.
- Plain View suppression can mark the frame as not rendered even when a fallback source was available.

## Acceptance notes

- FeatureTrace and debug snapshots should agree on the final visual truth.
- Copy Everything should surface the same normalized visual result without recomputing policy.
- Approved visual packets should remain separate from fallback and generated visual paths.
