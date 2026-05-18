# v2.7.33 Patch Notes

## Added
- MVP-ready validation language for the trainer.
- “Blundr Brain Validated” product badge for verified teaching cues.
- Lightweight learning-event foundation for future progress, Review, and product improvement.
- Local/stubbed learning event capture for training attempts, view mode, validation status, and timing.

## Changed
- Main trainer UI no longer exposes raw engine terms such as Stockfish, MultiPV, top-two, or internal statuses.
- Pattern Cue Card now uses product language: Checking position, Verified, Line needs review, and Move not verified.
- Wrong-move feedback now uses clean drill language instead of engine-validation wording.
- Reveal card distinguishes Verified move from Saved line move in user-ready language.

## Preserved
- Move Quality Gate behavior from v2.7.32.
- No automatic /api/brain calls during normal training.
- Manual Reveal/debug remains available.
- Technical validation details remain in debug/dev panels only.
- No external analytics or backend persistence is added yet.

## Not included
- Maia bot integration.
- Accounts/authentication.
- Database persistence.
- External analytics.
- Review gamification.
