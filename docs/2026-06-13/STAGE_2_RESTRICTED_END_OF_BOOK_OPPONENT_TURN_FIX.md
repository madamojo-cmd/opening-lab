# Stage 2 Restricted End-Of-Book Opponent-Turn Fix

## Scope

- Fix the restricted-mode freeze when a user move exhausts the runtime/book line on the opponent turn.
- Do not auto-enter continuation.
- Do not schedule Maia, Stockfish, or emergency opponent fallback before the user clicks Continue from Here.
- Do not change runtime-book candidate selection.

## Root Cause

- Restricted mode could schedule or keep a pending opponent reply after the user completed the final mapped move of a line.
- The board was then on the opponent turn with no book candidate, no continuation permission, and a pending opponent request.
- The user-facing state could remain on "Opponent is replying" instead of surfacing the branch-complete handoff.

## Fix

- Added an explicit restricted exhaustion detector for:
  - `trainingMode === "restricted"`
  - continuation not explicitly entered
  - side to move is the opponent after the user's move
  - current restricted/runtime line node exists
  - no next opponent move exists in the selected line
- The branch-complete contract now treats this as line exhaustion.
- Opponent scheduling is blocked and pending requests are cleared for this state.
- The branch transition surface renders:
  - title: `Line complete`
  - body: `You finished this training line. Continue from this position or train the line again.`
  - actions: `continue_from_here`, `restart_line`
- Recovery reason added:
  - `restricted_book_exhausted_on_opponent_turn_after_user_move`

## Debug Fields

- `restrictedLineExhaustedOnOpponentTurn`
- `branchCompleteRecoveredFromOpponentTurn`
- `blockedOpponentRequestInRestrictedExhaustedLine`

## Regression Coverage

- Added `lib/blundr/runtime/__tests__/restrictedLineExhaustionContract.test.ts`.
- Added the contract to `npm run test:trainer-debug`.
- The test covers the known Italian White sequence ending after `g1f3`.

## Tests

- `npm run test:trainer-debug` -> pass
- `npx tsx lib/blundr/runtime/__tests__/restrictedLineExhaustionContract.test.ts` -> pass
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts` -> pass

RESTRICTED_END_OF_BOOK_OPPONENT_TURN_HANDOFF: ACCEPTED
PENDING_OPPONENT_REQUEST_RESTRICTED_EXHAUSTED_LINE: RESOLVED
