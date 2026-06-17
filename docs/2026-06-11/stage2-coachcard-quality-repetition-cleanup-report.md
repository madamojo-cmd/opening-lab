# Stage 2 CoachCard Quality and Repetition Cleanup Report

## Scope

- Targeted copy-quality polish on the final learner-facing approved packets only.
- No move authority changes.
- No runtime data changes.
- No opening coverage changes.
- No new lines or openings.
- No packet ID, moveUci, moveSan, playKey, lineId, learnerSide, sideToMove, or castling metadata changes.
- No opening visibility/public/beta/dev status changes.

## Branch And Baseline

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `089916b` (`Consolidate Stage 2 app page trainer resolution`)

## Scan Summary

- Packets scanned: `2515`
- Openings scanned: `21`
- Patch overlay packets changed: `20`
- Effective packets after patch overlay: `2515`
- Effective openings after patch overlay: `21`

## Repetition Stats Before

- Unique CoachCard titles: `190`
- Unique CoachCard bodies: `388`
- Unique assisted bodies: `388`
- Unique plain_hint bodies: `190`
- Unique plain_show_more bodies: `389`

### Most Repeated Titles Before

- `49x` `Keep the Pirc setup coherent`
- `47x` `Keep Scandinavian development connected to the center`
- `46x` `Keep Petroff play solid`
- `42x` `Keep French counterplay aimed at the center`
- `40x` `Keep Vienna development purposeful`
- `39x` `Keep the English flexibility intact`
- `33x` `Keep the QGD center solid`

### Most Repeated Bodies Before

- `25x` `b6 signals the Queen’s Indian plan: the c8 bishop is headed to the long diagonal. Black aims pressure at e4 and the central dark squares.`
- `25x` `Bb4 is the Nimzo-Indian’s defining move: Black pressures the c3 knight that helps White control e4 and d5. This creates structural and central tension without overclaiming tactics.`
- `25x` `Bb5 is the Spanish bishop move: it pressures the knight that helps defend Black’s e5 pawn. The idea is long-term central pressure, not an immediate pawn win.`
- `25x` `Bc5 develops the bishop to an active Italian square, keeping pressure on White’s kingside and clearing Black to castle. It also keeps an eye on the central light squares.`
- `25x` `Bd3 develops the bishop to the classic Colle diagonal toward the kingside. It supports castling and later attacking chances if the center opens.`

### Most Repeated Plain Hints Before

- `49x` `Develop behind the compact setup and prepare to challenge White’s center.`
- `47x` `Develop behind the early central challenge and keep pressure on White’s pawns.`
- `46x` `Maintain the e-pawn tension, develop cleanly, and avoid early tactical drift.`
- `42x` `Build the e-pawn and queen-pawn center, then pressure White’s pawn chain.`
- `40x` `Support the center, develop quickly, and avoid premature queen attacks.`

### Most Repeated Show More Bodies Before

- `25x` `The target is b6. ...b6 is the defining queenside fianchetto setup for the Queen’s Indian. Exact move: move the b-pawn to b6 (b6).`
- `25x` `The target is Bb4. The bishop pressure is directly tied to White’s c3 knight and central control. Exact move: move the bishop from f8 to b4 (Bb4).`
- `25x` `The target is Bb5. The Ruy Lopez is defined by bishop pressure on the c6 knight and the e5 structure behind it. Exact move: move the bishop from f1 to b5 (Bb5).`
- `25x` `The target is Bc5. ...Bc5 is the defining active Italian response when Black chooses development over passive defense. Exact move: move the bishop from f8 to c5 (Bc5).`

## Banned Phrase Results Before

- `This is a good move.`: `0`
- `Continue the position.`: `0`
- `Develop a piece.`: `0`
- `Improve your position.`: `0`
- `This follows opening principles.`: `0`
- `Active Piece Development.`: `0`
- `Avoid Blocking Center Pawn.`: `0`
- `Keep playing normally.`: `0`
- `Make a useful move.`: `0`
- `This is standard.`: `0`
- `This is theory.`: `0`
- `Good developing move.`: `0`
- `Natural move.`: `0`
- `Play the move.`: `0`

## Quality Issues Found

- A small number of opening families carried most of the repetition load.
- Several repeated families used mechanical opening-plan phrasing.
- Plain hints were often structurally safe but sounded fallback-like.
- Show More bodies were repetitive and formulaic even when they were valid.

## Polish Scope Chosen

- Patched 20 high-priority packets only.
- Focused on repeated early-move cards, generic titles, fallback-like plain hints, and mechanical Show More phrasing.
- Preserved packet IDs and all non-copy fields.

## Packets Changed

- `italian-white.line-001.ply-05.f1c4`
- `london-white.line-001.ply-01.d2d4`
- `colle-white.line-001.ply-07.f1d3`
- `english-white.line-001.ply-11.b2c3`
- `french-black.line-001.ply-04.d7d5`
- `french-black.line-002.ply-08.f6d7`
- `scandinavian-black.line-001.ply-02.d7d5`
- `scandinavian-black.line-002.ply-08.c5d4`
- `petroff-black.line-001.ply-04.g8f6`
- `petroff-black.line-001.ply-12.d8d5`
- `pirc-black.line-001.ply-12.d8d1`
- `qgd-black.line-002.ply-08.b8c6`
- `reti-white.line-001.ply-03.c2c4`
- `vienna-white.line-001.ply-11.h2h3`
- `kings-indian-black.line-001.ply-08.d7d6`
- `kings-indian-black.line-001.ply-10.e8g8`
- `nimzo-indian-black.line-001.ply-06.f8b4`
- `queens-indian-black.line-001.ply-06.b7b6`
- `ruy-lopez-white.line-001.ply-05.f1b5`
- `scotch-white.line-001.ply-05.d2d4`

## Fields Changed

- `coachCard.title`
- `coachCard.body`
- `coachCard.why`
- `coachCard.principle`
- `surfaces.assisted.title`
- `surfaces.assisted.body`
- `surfaces.plain_hint.title`
- `surfaces.plain_hint.body`
- `surfaces.plain_show_more.title`
- `surfaces.plain_show_more.body`
- `surfaces.review.title`
- `surfaces.review.body`

## Repetition Stats After

- Unique CoachCard titles: `208`
- Unique CoachCard bodies: `404`
- Unique assisted bodies: `405`
- Unique plain_hint bodies: `207`
- Unique plain_show_more bodies: `404`

### Most Repeated Titles After

- `48x` `Keep the Pirc setup coherent`
- `46x` `Keep Scandinavian development connected to the center`
- `45x` `Keep Petroff play solid`
- `41x` `Keep French counterplay aimed at the center`
- `39x` `Keep Vienna development purposeful`
- `38x` `Keep the English flexibility intact`
- `32x` `Keep the QGD center solid`

### Most Repeated Bodies After

- `25x` `Bc5 develops the bishop to an active Italian square, keeping pressure on White’s kingside and clearing Black to castle. It also keeps an eye on the central light squares.`
- `25x` `Bg7 completes the King’s Indian fianchetto. The bishop now works against White’s central and queenside dark squares from a safe distance.`
- `25x` `c3 completes the d4/e3/c3 Colle structure. White reinforces d4 and prepares to choose the right moment for e4.`
- `25x` `c4 is the English Opening’s defining flank claim: White’s c-pawn controls d5 without committing the e-pawn or d-pawn immediately.`
- `25x` `c6 is the Slav’s key support move: Black reinforces d5 with the c-pawn instead of locking in the light-square bishop immediately.`

### Most Repeated Plain Hints After

- `48x` `Develop behind the compact setup and prepare to challenge White’s center.`
- `47x` `Develop behind the early central challenge and keep pressure on White’s pawns.`
- `45x` `Maintain the e-pawn tension, develop cleanly, and avoid early tactical drift.`
- `41x` `Build the e-pawn and queen-pawn center, then pressure White’s pawn chain.`
- `39x` `Support the center, develop quickly, and avoid premature queen attacks.`

### Most Repeated Show More Bodies After

- `25x` `The target is Bc5. ...Bc5 is the defining active Italian response when Black chooses development over passive defense. Exact move: move the bishop from f8 to c5 (Bc5).`
- `25x` `The target is Bg7. The g7 bishop is one of Black’s main sources of counterplay in the King’s Indian. Exact move: move the bishop from f8 to g7 (Bg7).`
- `25x` `The target is c3. The c3 move is opening-specific because it makes the Colle center sturdy before expansion. Exact move: move the c-pawn to c3 (c3).`
- `25x` `The target is c4. The English often begins with side control of d5 and keeps transpositions available without overcommitting the center. Exact move: move the c-pawn to c4 (c4).`

## Banned Phrase Results After

- `This is a good move.`: `0`
- `Continue the position.`: `0`
- `Develop a piece.`: `0`
- `Improve your position.`: `0`
- `This follows opening principles.`: `0`
- `Active Piece Development.`: `0`
- `Avoid Blocking Center Pawn.`: `0`
- `Keep playing normally.`: `0`
- `Make a useful move.`: `0`
- `This is standard.`: `0`
- `This is theory.`: `0`
- `Good developing move.`: `0`
- `Natural move.`: `0`
- `Play the move.`: `0`

## Plain View No-Leak Result

- No plain_hint SAN/UCI leaks were detected after the polish pass.

## Copy Patch Path

- Patch file: `/workspaces/opening-lab/data/blundr/stage2-approved-content-copy-polish-patch-v1/copy-patch.jsonl`

## Exact-Match / Fallback / Opening Availability / Authority Notes

- Exact-match live rendering still passes.
- Fallback still works when no approved packet matches.
- Castling normalization still passes.
- Opening availability remains unchanged.
- Move authority remains unchanged.
- No live Lichess calls were introduced.

## Tests Run

- `node --import tsx tests/coach/stage2CoachCardQualityRepetitionAudit.test.ts`
- `node --import tsx tests/coach/stage2ApprovedCoachCardNoGenericCopy.test.ts`
- `node --import tsx tests/coach/stage2ApprovedCoachCardPlainHintNoLeakAfterPolish.test.ts`
- `node --import tsx tests/coach/stage2ApprovedCoachCardCopyPatchIntegrity.test.ts`
- `node --import tsx tests/coach/stage2ApprovedCoachCardQualityRegression.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingNegativeMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingPlainView.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingShowMore.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingCastlingNormalization.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingFeatureTrace.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts`
- `node --import tsx tests/coach/stage2OpeningAvailabilityProductReadiness.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityNoPublicByAccident.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentAvailabilityMatchesBundles.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2AppPagePolicyInventory.test.ts`
- `node --import tsx tests/coach/stage2TrainerFrameResolutionNoBypass.test.ts`
- `node --import tsx tests/coach/stage2AppPageResolverParity.test.ts`
- `node --import tsx tests/coach/stage2AppPageApprovedContentParity.test.ts`
- `node --import tsx tests/coach/stage2AppPagePlainViewParity.test.ts`
- `node --import tsx tests/coach/stage2AppPageContinuationParity.test.ts`
- `node --import tsx tests/coach/stage2AppPageOpeningAvailabilityParity.test.ts`
- `node --import tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `node --import tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `node --import tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `node --import tsx tests/coach/promotionPickerAuthority.test.ts`
- `node --import tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `node --import tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `node --import tsx tests/coach/stage2FeatureTrace.test.ts`
- `node --import tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

## Build Result

- `npm run build` passed.

## Known Limitations

- The polish patch is intentionally narrow.
- The remaining bundle still contains some repeated opening-family phrasing.
- This is a targeted copy-quality pass, not a full rewrite of the approved content library.

## Recommended Next Phase

- Expand the patch only if future QA finds another concentrated repetition cluster worth polishing.

STAGE_2_COACHCARD_QUALITY_REPETITION_CLEANUP_STATUS: COMPLETE
