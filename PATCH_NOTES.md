# Blundr v2.7 Stability Temporal Core

This deployment is intended to get the app through Step 4 testing.

## Included fixes

1. Stale `/api/brain` response guard
   - Adds request sequencing and normalized-FEN validation before applying Brain responses.
   - Aborts older in-flight Brain fetches when a newer request starts.
   - Prevents old GPT/Brain annotations from overwriting the current turn.

2. Fast local visual annotation
   - The board now receives an immediate local annotation on each train-position update.
   - The visual layer stays active while Browser Stockfish/GPT Brain refine in the background.
   - Brain no longer blanks the board with `setVisualReady(false)` while waiting.

3. Book Complete detection
   - Restricted mode now marks Book Complete when the saved branch ends on the user's turn.
   - Prevents the user from being punished with “No saved move” after finishing a branch.

4. Continue vs Bot first-click fix
   - `playOpponentMove(forceContinuation = false)` now supports a forced continuation mode.
   - `Continue vs Bot` calls `playOpponentMove(true)` so stale React state does not keep the bot in restricted mode.

5. Temporal Gate overlay core
   - Replaces the old tiny-dot curved overlay with source circle, destination circle, and clean rails.
   - Knight geometry is detected from square coordinates and rendered as a true L-shaped polyline.
   - Color language: attack coral, defense teal, plan blue, opponent violet.

## Manual test focus

- Restricted mode enforces saved repertoire moves.
- Book Complete appears when a branch ends.
- Continue vs Bot works on the first click.
- Continuation mode accepts legal moves.
- Opponent replies do not leave wrong-side stale visuals.
- Knight moves never render diagonally.
- Toggling Attack / Defense / Plan does not break board sync.

## Build verification

`npm install` and `NEXT_TELEMETRY_DISABLED=1 npm run build` passed locally.
