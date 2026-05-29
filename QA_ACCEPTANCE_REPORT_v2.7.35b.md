# v2.7.35b QA Acceptance Report

## Build
[x] `npm run build` passes.
[x] No TypeScript errors.

## Brain/GPT Safety
[x] `runBrain("position_update")` is absent from `app/page.tsx`.
[x] `runBrain("wrong_move")` is absent from `app/page.tsx`.
[x] Manual `runBrain("reveal")` remains present.
[ ] Browser Network QA confirms normal training does not call `/api/brain`.

## Training Context Engine
[x] `buildTrainingContext` exists.
[x] `buildChessFeatureGraph` exists.
[x] `analyzeMoveSemantics` exists.
[x] Move recommendation trust is separated from teaching context trust.
[x] Rejected saved moves can become Assisted Context instead of defaulting to Line Needs Review.
[x] “Next: Play” is suppressed for rejected or untrusted moves.
[x] Visual routing distinguishes answer visuals from context visuals.

## Required Scenarios
[ ] Rejected Be3 with Bg5 top alternative shows Assisted View • Assisted context.
[ ] Rejected Be3 with Bg5 top alternative does not show “Next: Play Be3.”
[ ] Rejected Be3 with Bg5 top alternative does not show an answer arrow to Be3.
[ ] Rejected Be3 with Bg5 top alternative shows a grounded bishop/activity cue.
[ ] Verified Bc4 pressure move shows Develop with pressure.
[ ] Verified Bc4 pressure move may show the answer arrow.
[ ] Verified Nf3 development/control move shows Develop and control.
[ ] Unverified saved move with rich context shows Assisted context.
[ ] Unverified saved move with no safe context shows Line needs review or Move not verified.
[ ] Context-only loose piece shows Watch the loose piece.
[ ] Center tension position shows Center tension.
[ ] King safety position shows King safety first.
[ ] Open file position shows Use the open file.
[ ] Weak square/outpost position shows weak-square or outpost context.
[ ] Simple endgame king activity position shows Activate the king.
[ ] Strong alternative is respected, not punished.
[ ] Bad alternative is not falsely endorsed.
[ ] Plain View shows zero pre-move visuals.
[ ] Assisted Context shows context visuals without answer arrows.
[ ] Verified move answer visuals are shown when permission allows.
[ ] Visual concept alignment is visible in debug.
[ ] Debug shows story scoring, semantic effects, top move comparisons, grounding, and suppression reasons.
[ ] Learning metadata includes trust, story, visual, and next-play suppression fields.

## Verification Commands
[x] `grep -R 'runBrain("position_update"' -n app/page.tsx || true`
[x] `grep -R 'runBrain("wrong_move"' -n app/page.tsx || true`
[x] `grep -R 'runBrain("reveal"' -n app/page.tsx || true`
[x] `grep -R 'Next: Play' -n app lib || true`
[x] `grep -R 'Playable but keep improving the plan' -n app lib || true`
[x] `grep -R 'Finish development' -n app lib || true`
[x] `grep -R 'visual_concept_mismatch' -n app lib || true`
[x] `grep -R 'buildTrainingContext' -n app lib || true`
[x] `grep -R 'buildChessFeatureGraph' -n app lib || true`
[x] `grep -R 'analyzeMoveSemantics' -n app lib || true`
[x] `grep -R 'MoveRecommendationTrust' -n app lib || true`
[x] `grep -R 'TeachingContextTrust' -n app lib || true`

## Manual Browser QA Needed
[ ] Run `npm run dev`.
[ ] Open DevTools Network and filter `/api`.
[ ] Load restricted training.
[ ] Confirm `/api/blundr-visual-model` may appear.
[ ] Confirm `/api/brain` does not appear during load, position changes, or wrong restricted moves.
[ ] Confirm Reveal may call `/api/brain`.

