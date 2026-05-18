# v2.7.33 QA Acceptance Report

## Build
[x] npm run build passes.
[x] No TypeScript errors.

## Brain/GPT
[x] Normal trainer load does not call /api/brain.
[x] Position changes do not call /api/brain.
[x] Wrong restricted moves do not call /api/brain.
[x] Manual Reveal can still call /api/brain.

## MVP Language
[x] Main Pattern Cue Card does not expose Stockfish, MultiPV, top-two, verified_top1, or verified_top2.
[x] Main trainer UI uses Blundr Brain Validated for verified cues.
[x] Pending state says Checking position.
[x] Rejected state says Line needs review.
[x] Unavailable state says Move not verified.
[x] Wrong-move feedback uses clean drill language.
[x] Reveal card says Verified move or Saved line move.
[x] Technical engine details appear only in Show More/debug.

## Learning Events
[ ] Correct restricted move records a learning event locally/stubbed.
[ ] Wrong restricted move records a learning event locally/stubbed.
[ ] Manual Reveal records a learning event locally/stubbed.
[x] Event includes trainerView, trainingMode, FEN, expected move, played move when present, correctness, validation status, and time-to-move if available.
[x] Event does not include unnecessary personal data.
[x] Event system works without account login.
[x] Event system does not send data externally.
