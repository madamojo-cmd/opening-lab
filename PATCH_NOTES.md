# Blundr v2.7.1 Product Stability + Review Patch

This deployment extends the v2.7 stability temporal core build with the requested product-facing fixes.

## Recommendation / Engine Fix
- Continuation-mode user recommendations no longer draw random legal fallback moves.
- After the bot plays, the plan view shows an engine-pending state until browser Stockfish returns.
- Once browser Stockfish returns, the board highlights the actual Stockfish top move.
- GPT/Brain text can refine the explanation, but continuation plan geometry stays engine-backed.

## Board View Stability
- Switching Attack, Defense, and Plan no longer retriggers `/api/brain` analysis.
- Active board views render from the cached annotation for the current FEN until a move changes the position.

## Advantage / Evaluation Display
- Replaced confusing positive/negative eval label with a side-explicit label: `White +x`, `Black +x`, `Equal`, or mate status.
- Engine output is cleared when the FEN changes so stale evals are not displayed during a new position.

## Captured Pieces + Material
- Added captured piece strips above and below the board.
- Top strip shows opponent-side captured material context.
- Bottom strip shows user-side captured material context.
- Only the side with a material advantage displays `+N material`; the losing side does not show a redundant negative count.

## Legal Move Preview
- Selecting a piece now highlights all legal destination squares.
- Capturing destinations receive a stronger red-ring treatment.

## Settings
- Added a board settings panel.
- Board themes: Classic, Slate, Blue, Walnut.
- Piece styles: Classic, Neo, Letters.
- Active display toggles: Attack view, Defense view, Plan view, legal move dots, advantage bar, captured pieces, move labels, opponent cue.
- Settings persist in localStorage.

## Game Ending UX
- Terminal positions now show a clear game-concluded card.
- Checkmate, stalemate, draw, repetition, and insufficient-material endings are identified.
- Restart button is shown after the game ends.

## Move Review Controls
- Added back/forward controls below the board.
- Users can step backward and forward through prior positions.
- Moving is blocked while reviewing an older position to avoid corrupting the live training state.

## Build Verification
- `npm install --no-audit --no-fund`: passed.
- `npm run build`: passed with Next.js 16.2.6 / Turbopack.
