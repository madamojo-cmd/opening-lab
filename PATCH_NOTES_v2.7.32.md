# v2.7.32 Patch Notes

## Added
- Stockfish-based Move Quality Gate for restricted training.
- Top-two validation for expected training moves.
- Pending, verified, rejected, and unavailable validation states.
- Validation cache keyed by FEN and expected candidate moves.
- Debug details for expected move, Stockfish top-two moves, and gate result.

## Changed
- Assisted View now suppresses teaching cues until the expected move is verified.
- Pattern Cue Card now shows “Validating move quality,” “Line needs review,” or “Move not verified” when appropriate.
- Board arrows, pressure lines, and target rings are hidden for unverified restricted-training moves.
- Manual Reveal remains available but distinguishes saved-line moves from verified recommendations.

## Preserved
- No automatic /api/brain calls on normal trainer position updates.
- No automatic /api/brain calls after wrong restricted moves.
- /api/brain remains available for manual Reveal/debug.
- /api/blundr-visual-model remains the deterministic visual source.
- Plain View still hides pre-move hints.

## Not included
- Maia bot integration.
- Full BotMoveSelector refactor.
- Lichess book depth policy changes.
- Review gamification.
