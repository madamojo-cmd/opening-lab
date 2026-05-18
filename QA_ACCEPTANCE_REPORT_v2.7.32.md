# v2.7.32 QA Acceptance Report

## Build
[x] npm run build passes.
[x] No TypeScript errors.
[ ] Existing v2.7.31 behavior remains intact.

## Brain/GPT
[ ] Normal trainer load does not call /api/brain.
[ ] Position changes do not call /api/brain.
[ ] Wrong restricted moves do not call /api/brain.
[ ] Manual Reveal can still call /api/brain.

## Move Quality Gate
[ ] Restricted user-turn position starts with move-quality pending state.
[ ] Stockfish returns top-two candidate moves.
[ ] Expected move matching rank 1 shows verified_top1.
[ ] Expected move matching rank 2 shows verified_top2.
[ ] Expected move outside top two shows rejected.
[ ] Engine failure/timeout shows unavailable.
[ ] Validation result is cached by FEN + expected move list.
[ ] Revisited position uses cache instead of repeated engine validation when possible.

## Assisted View
[ ] Assisted View does not show teaching cue until move is verified.
[ ] Assisted View shows Pattern Cue Card after verified_top1 or verified_top2.
[ ] Assisted View hides arrows/pressure lines/target rings while pending.
[ ] Assisted View hides arrows/pressure lines/target rings when rejected.
[ ] Assisted View shows “Line needs review” when rejected.
[ ] Assisted View shows “Move not verified” when unavailable.

## Plain View
[ ] Plain View still shows “Find the next move.”
[ ] Plain View hides pre-move hints regardless of validation.
[ ] Legal move dots still work in Plain View.
[ ] Normal board interaction still works.

## Wrong Move
[ ] Wrong move produces deterministic feedback.
[ ] Wrong move does not trigger /api/brain.
[ ] Wrong move does not present unverified saved line as “best.”

## Debug
[ ] Show More debug includes Move Quality Gate status.
[ ] Debug lists expected UCI moves.
[ ] Debug lists expected SAN moves if available.
[ ] Debug lists Stockfish top-two UCI moves.
[ ] Debug includes gate reason.
[ ] Debug shows whether validation is required.
[ ] Debug shows whether hints are hidden by validation.

## Manual Browser QA
[ ] Loading a restricted training position may call /api/blundr-visual-model.
[ ] Loading a restricted training position does not call /api/brain.
[ ] Moving through training positions does not call /api/brain.
[ ] Wrong restricted move does not call /api/brain.
[ ] Clicking Reveal may call /api/brain.
[ ] No product copy says every position is sent to GPT/Brain.
