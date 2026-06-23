# Stage 2 Canonical Opening Identity Terminal Proof Repair

## Scope

- Centralized Stage 2 opening identity canonicalization.
- Terminal proof now rejects stale/noncanonical opening identity latches.
- Debug / Copy Everything now reports canonical opening identity truth.
- No move authority changes.
- No continuation behavior changes.
- No branch-complete policy changes beyond rejecting stale alias-driven proof.

## Root Cause

- `selectedOpeningId` / `selectedLineId` could remain on the legacy alias `ruy-white` while the runtime book and approved runtime package used canonical `ruy-lopez-white`.
- The terminal-proof path previously allowed a valid branch-complete latch to survive even when the selected opening identity was stale or unavailable.
- Debug snapshots and Copy Everything were not consistently reporting canonical opening identity fields.

## Canonical Identity Repair

- Added `lib/blundr/openings/openingIdentity.ts`.
- Central alias map now resolves legacy ids through one canonical helper.
- `openingAvailability.ts` now canonicalizes alias ids before lookup.
- `terminalProof.ts` now requires canonical opening identity, runtime opening match, runtime availability, and explicit completion evidence.
- `buildTrainerFrameResolution.ts` now carries the opening identity resolution.
- `trainerDebugSnapshot.ts` and `BlundrDiagnosticsPanel.tsx` now report canonical opening identity fields.
- `app/page.tsx` now routes branch-complete and runtime-book decisions through canonical opening identity.

## Tests Run

- `node --import tsx tests/coach/stage2CanonicalOpeningIdentityRequiredForTraining.test.ts`
- `node --import tsx tests/coach/stage2LegacyOpeningIdCanonicalization.test.ts`
- `node --import tsx tests/coach/stage2TerminalProofRejectsRuntimeUnavailableOpening.test.ts`
- `node --import tsx tests/coach/stage2TerminalProofRejectsRuntimeOpeningMismatch.test.ts`
- `node --import tsx tests/coach/stage2TerminalProofRejectsUnknownLineCursor.test.ts`
- `node --import tsx tests/coach/stage2TerminalProofRejectsStaleBranchCompleteLatch.test.ts`
- `node --import tsx tests/coach/stage2RuyWhiteAliasDoesNotPrematurelyBranchComplete.test.ts`
- `node --import tsx tests/coach/stage2CopyEverythingReportsCanonicalOpeningIdentity.test.ts`
- `node --import tsx tests/coach/stage2TerminalProofRequiredForBranchComplete.test.ts`
- `node --import tsx tests/coach/stage2CopyEverythingReportsTerminalProof.test.ts`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`

## Build

- `npm run build` passed.

## Verified Outcomes

- `ruy-white` is canonicalized to `ruy-lopez-white` through the shared alias map.
- Terminal proof rejects runtime-unavailable or runtime-mismatched opening identity.
- A stale branch-complete latch can no longer force terminal proof by itself.
- Copy Everything now reports both raw and canonical opening identity truth.
- Existing branch-complete regression coverage remains green.

## Remaining Limitations

- Final browser QA still needs a fresh live proof showing:
  - `ruy-white` is canonicalized or blocked from `branch_complete`.
  - Italian White does not prematurely show `Line complete` after `e4 e5 Nf3`.
- Unrelated untracked review bundles, docs trees, sample/import artifacts, and `stage2-canonical-all23-12ply/` remain intentionally unstaged.

## Status

STAGE_2_CANONICAL_OPENING_IDENTITY_TERMINAL_PROOF_REPAIR_STATUS: ACCEPTED
