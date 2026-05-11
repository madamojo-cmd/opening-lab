# BlundrOneNet v0 Implementation Handoff

**Repo:** https://github.com/madamojo-cmd/opening-lab  
**Branch to work from:** `blundr-v2.7.1-product-review-core`  
**Previous stable branch:** `blundr-v2.7-stability-temporal-core`  
**Current app:** Next.js app on Vercel, custom board in `app/page.tsx`, `chess.js` for legal moves/FEN, browser Stockfish, API routes at `app/api/brain/route.ts` and `app/api/explorer/route.ts`.

## Global non-negotiables

1. Do not rebuild the app from scratch.
2. Do not replace `chess.js` legal move validation.
3. Do not let GPT decide legal moves.
4. Do not let the model invent tactics, mates, checks, legal moves, arrows, or square coordinates.
5. Do not display random legal fallback moves as user-facing recommendations.
6. Continuation recommendations must remain Stockfish-backed.
7. Attack/Defense/Plan tabs must not refetch Brain/model on tab switch.
8. Old Brain/GPT/model responses must not overwrite the current FEN.
9. Knight moves must render as true L-shaped paths.
10. Book Complete and Continue vs Bot must keep working.
11. Captured pieces, material advantage, stable eval display, game-over UI, selected-piece legal moves, settings, and move review must remain intact.
12. The model layer must fail safely back to deterministic/rule output.

## Before editing

Run these checks in Codespaces:

```bash
git checkout blundr-v2.7.1-product-review-core
git pull
git log --oneline -5
git diff --stat blundr-v2.7-stability-temporal-core..blundr-v2.7.1-product-review-core
cat PATCH_NOTES.md | head -80
tree -L 4 -I "node_modules|.next|.git"
npm run build
```

Treat the fixed A-J product issues from v2.7.1 as regression-protected behavior, not as unresolved bugs.

---

# 02 — Training State Machine Handoff

## Objective

Formalize the training phase logic so BlundrOneNet never recommends a move for the wrong side, never lets stale Brain/model output overwrite the current FEN, and never breaks the v2.7.1 continuation fixes.

This is not a rebuild of the trainer. It is a small layer that clarifies who is expected to act for each FEN.

## Current-code integration points

Primary file:

```txt
app/page.tsx
```

Likely existing functions/state names to inspect:

```txt
runBrain()
annotation state updates
trainingMode
bookComplete
expectedUserOptions
continueVsBot()
playOpponentMove(forceContinuation?)
active board view state
cached annotation object
FEN/request sequence guard
AbortController/stale response protection
```

New file:

```txt
lib/blundr/trainingStateMachine.ts
```

## Files to create/modify

### Create `lib/blundr/trainingStateMachine.ts`

```ts
import type { Color, ExpectedActor, TrainingPhase } from "./types";

export type PhaseDecision = {
  trainingPhase: TrainingPhase;
  expectedActor: ExpectedActor;
  expectedMoveColor?: Color;
  shouldRequestVisualModel: boolean;
  reason: string;
};

export function oppositeColor(color: Color): Color {
  return color === "w" ? "b" : "w";
}

export function expectedActorForPhase(phase: TrainingPhase): ExpectedActor {
  switch (phase) {
    case "awaiting_user_move":
    case "awaiting_user_continuation_choice":
    case "guided_continuation":
      return "user";
    case "opponent_to_move":
      return "opponent";
    case "showing_user_move_feedback":
    case "showing_opponent_context":
    default:
      return "system";
  }
}

export function expectedMoveColorForActor(actor: ExpectedActor, userColor: Color): Color | undefined {
  if (actor === "user") return userColor;
  if (actor === "opponent") return oppositeColor(userColor);
  return undefined;
}

export function decideVisualPhase(input: {
  fenSideToMove: Color;
  userColor: Color;
  trainingPhase: TrainingPhase;
  bookComplete?: boolean;
  hasExpectedUserMove?: boolean;
}): PhaseDecision {
  const expectedActor = expectedActorForPhase(input.trainingPhase);
  const expectedMoveColor = expectedMoveColorForActor(expectedActor, input.userColor);

  if (expectedActor !== "system" && expectedMoveColor !== input.fenSideToMove) {
    return {
      trainingPhase: input.trainingPhase,
      expectedActor,
      expectedMoveColor,
      shouldRequestVisualModel: false,
      reason: `Phase/color mismatch: phase expects ${expectedMoveColor}, FEN has ${input.fenSideToMove}`
    };
  }

  if (
    input.trainingPhase === "awaiting_user_move" &&
    input.bookComplete &&
    !input.hasExpectedUserMove
  ) {
    return {
      trainingPhase: "awaiting_user_continuation_choice",
      expectedActor: "user",
      expectedMoveColor: input.userColor,
      shouldRequestVisualModel: true,
      reason: "Book complete; ask user whether to continue."
    };
  }

  return {
    trainingPhase: input.trainingPhase,
    expectedActor,
    expectedMoveColor,
    shouldRequestVisualModel: true,
    reason: "Phase is aligned with FEN."
  };
}
```

## Implementation logic

1. Identify where `app/page.tsx` currently determines whether it is user turn, opponent turn, restricted mode, or continuation mode.
2. Import the helper functions.
3. Before any Brain/model request, compute:

```txt
fenSideToMove
userColor
trainingPhase
expectedActor
expectedMoveColor
requestAllowed
```

4. If the state machine says `shouldRequestVisualModel: false`, do not call Brain/model. Instead, show a safe pending/transition state and let existing flow resolve opponent/user state.
5. Preserve the v2.7.1 stale request guard. Do not remove `AbortController`, request sequence, or FEN guard logic if present.

## Required debug object

Every model/Brain request should be traceable to:

```ts
const visualDebugState = {
  normalizedFen,
  fenSideToMove,
  userColor,
  trainingPhase,
  expectedActor,
  expectedMoveColor,
  requestAllowed,
  requestId
};
```

## Pseudocode

```txt
on position/FEN change:
  derive fenSideToMove from chess.js
  derive current trainingPhase from existing app state
  call decideVisualPhase()

  if not allowed:
    do not call Brain/model
    keep existing annotation or show transition-safe pending state
    return

  create requestId tied to normalizedFen + phase + expectedActor
  call Brain/model
  when response returns:
    if response.requestId != latest requestId: ignore
    if response.normalizedFen != current normalizedFen: ignore
    commit annotation
```

## Validation tests

Regression tests from v2.7.1:

```txt
A. Wrong-side recommended move bug stays fixed.
B. Attack/Defense/Plan tab changes do not refetch Brain/model.
C. Book Complete still appears when saved repertoire ends.
D. Continue vs Bot works on first click.
E. Continuation recommendations remain Stockfish-backed.
```

Manual wrong-side trap:

```txt
Set trainingPhase = awaiting_user_move.
Force FEN sideToMove to opponent color.
Expected: no user recommendation is requested or displayed.
Debug panel says phase/color mismatch.
```

## Acceptance criteria

- Brain/model requests are keyed by FEN + phase + expected actor.
- Wrong-side recommendations cannot display even if a stale response returns late.
- Continuation state still works exactly as in v2.7.1.
- Attack/Defense/Plan tab switching does not cause model reload.
- `npm run build` passes.

## Common failure modes

- Calling model from a `useEffect` that depends on active visual tab.
- Letting `setTrainingMode("continuation")` immediately call a function that reads stale state. Keep the existing `playOpponentMove(true)` pattern.
- Committing annotation from an old FEN.
- Treating `showing_opponent_context` as opponent-to-move rather than system explanation.

## What not to change

- Do not remove existing stale-response protection.
- Do not change the fixed continuation button logic.
- Do not let the state machine pick legal moves.
- Do not replace restricted mode/book logic.
- Do not make Attack/Defense/Plan views trigger network calls.
