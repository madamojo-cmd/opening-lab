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

# 01 — Contracts and Enums Handoff

## Objective

Create the formal BlundrOneNet v0 contract that every layer shares:

- Current trainer UI in `app/page.tsx`
- New feature packet builder
- New verifier
- New rule-based visual selector fallback
- Future optional FastAPI model service
- New `/api/blundr-visual-model` bridge
- Frontend board overlays and coaching panel

The contract must make model output boring, typed, bounded, and safe. The model should select from known IDs and candidate sets. It should not invent prose, tactics, or unsupported animation names.

## Current-code integration points

Primary current files:

```txt
app/page.tsx
app/globals.css
app/api/brain/route.ts
app/api/explorer/route.ts
package.json
next.config.ts
vercel.json
```

New files to create:

```txt
lib/blundr/types.ts
lib/blundr/animationPackages.ts
lib/blundr/concepts.ts
lib/blundr/contextTemplates.ts
lib/blundr/squareUtils.ts
```

If the repo currently lacks `lib/`, create it intentionally. Do not create a duplicate board or duplicate training app.

## Files to create/modify

### Create `lib/blundr/types.ts`

```ts
export type Color = "w" | "b";

export type ExpectedActor = "user" | "opponent" | "system";

export type TrainingPhase =
  | "awaiting_user_move"
  | "showing_user_move_feedback"
  | "opponent_to_move"
  | "showing_opponent_context"
  | "awaiting_user_continuation_choice"
  | "guided_continuation";

export type SelectedView =
  | "move"
  | "attack"
  | "defense"
  | "plan"
  | "continuation"
  | "mistake";

export type BlundrArrowRole =
  | "move"
  | "pressure"
  | "defense"
  | "future"
  | "threat"
  | "capture"
  | "retreat"
  | "pin"
  | "castle";

export type BlundrSquareRole =
  | "source"
  | "destination"
  | "weakness"
  | "center"
  | "defense"
  | "danger"
  | "future"
  | "soft_target"
  | "king_safety";

export type BlundrArrow = {
  from: string;
  to: string;
  role: BlundrArrowRole;
  intensity: number;
};

export type BlundrSquare = {
  square: string;
  role: BlundrSquareRole;
  animation: string;
};

export type BlundrContext = {
  headline: string;
  mainExplanation: string;
  visualExplanation: string;
  planExplanation: string;
  nextPlan: string;
  threatNote?: string;
};

export type BlundrVisualModelRequest = {
  fen: string;
  moveHistory: string[];
  userColor: Color;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  lastMove?: string;
  lastMoveBy?: ExpectedActor;
  expectedActor?: ExpectedActor;
  openingName?: string;
};

export type BlundrVisualModelOutput = {
  selectedMove: string;
  selectedView: SelectedView;
  primaryConcept: string;
  animationPackage: string;
  keySquares: string[];
  arrows: BlundrArrow[];
  squares: BlundrSquare[];
  context: BlundrContext;
  suppress: string[];
  confidence: number;
  debug?: {
    source: "rule" | "gpt_synthetic" | "blundr_one_net_v0" | "fallback" | "model_unavailable";
    verified: boolean;
    fallbackUsed: boolean;
    warnings?: string[];
    stockfishEvalCp?: number;
    stockfishBestMove?: string;
    openingName?: string;
    trainingPhase?: TrainingPhase;
    expectedActor?: ExpectedActor;
    sideToMove?: Color;
    userColor?: Color;
    normalizedFen?: string;
    requestId?: string;
  };
};
```

### Create `lib/blundr/animationPackages.ts`

```ts
export const BLUNDR_ANIMATION_PACKAGES = [
  "quiet-development-glow",
  "diagonal-pressure-glow",
  "knight-pressure-center",
  "center-break-pulse",
  "castle-safety-aura",
  "weak-square-pulse",
  "pin-line-tension",
  "fork-spark",
  "defensive-shield",
  "open-file-radar",
  "queen-danger-warning",
  "continuation-ghost-plan"
] as const;

export type BlundrAnimationPackage = typeof BLUNDR_ANIMATION_PACKAGES[number];

export function isSupportedAnimationPackage(value: string): value is BlundrAnimationPackage {
  return (BLUNDR_ANIMATION_PACKAGES as readonly string[]).includes(value);
}
```

### Create `lib/blundr/concepts.ts`

```ts
export const BLUNDR_CONCEPTS = [
  "quiet_development",
  "development_with_f7_pressure",
  "development_with_f2_pressure",
  "knight_center_pressure",
  "castle_for_safety",
  "prepare_center_break",
  "occupy_center",
  "defend_center",
  "pin_pressure",
  "open_file_pressure",
  "queen_activity_warning",
  "continuation_plan",
  "generic_stockfish_best_move"
] as const;

export type BlundrConcept = typeof BLUNDR_CONCEPTS[number];

export function isSupportedConcept(value: string): value is BlundrConcept {
  return (BLUNDR_CONCEPTS as readonly string[]).includes(value);
}
```

### Create `lib/blundr/contextTemplates.ts`

```ts
import type { BlundrContext } from "./types";

export const CONTEXT_TEMPLATES: Record<string, BlundrContext> = {
  quiet_development: {
    headline: "Develop your piece",
    mainExplanation: "This move improves your position by bringing a piece into the game.",
    visualExplanation: "The highlighted path shows the piece leaving its starting square and moving to an active square.",
    planExplanation: "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Develop another piece and get your king safe."
  },
  develop_with_pressure: {
    headline: "Develop with pressure",
    mainExplanation: "This develops a piece to an active square while creating pressure.",
    visualExplanation: "The key visual is the line from your piece toward the target square.",
    planExplanation: "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Castle next, then prepare your central plan."
  },
  knight_pressure_center: {
    headline: "Develop and pressure the center",
    mainExplanation: "This knight move develops a piece and adds pressure to the center.",
    visualExplanation: "The highlighted squares show the knight's influence near the center.",
    planExplanation: "Protect your center and continue developing your minor pieces.",
    nextPlan: "Develop the next piece and get your king safe."
  },
  castle_for_safety: {
    headline: "Get your king safe",
    mainExplanation: "Castling improves king safety and helps connect your rooks.",
    visualExplanation: "The safety highlight shows where your king is moving and why that area becomes safer.",
    planExplanation: "After castling, you can shift attention to the center or a pawn break.",
    nextPlan: "Finish development and prepare your central plan."
  },
  prepare_center_break: {
    headline: "Prepare the center break",
    mainExplanation: "This move supports a future central pawn push.",
    visualExplanation: "The highlighted center squares show where the position may open next.",
    planExplanation: "Do not rush the break until your pieces are ready.",
    nextPlan: "Complete development, then challenge the center."
  },
  generic_stockfish_best_move: {
    headline: "Best continuation",
    mainExplanation: "This is the engine-backed recommendation for the current position.",
    visualExplanation: "The highlighted move shows the recommended path from source to destination.",
    planExplanation: "Use this move to keep the position stable and continue developing your plan.",
    nextPlan: "Look for the opponent's most common response and continue from there."
  }
};

export function renderContextTemplate(templateId: string): BlundrContext {
  return CONTEXT_TEMPLATES[templateId] ?? CONTEXT_TEMPLATES.generic_stockfish_best_move;
}
```

### Create `lib/blundr/squareUtils.ts`

```ts
export const BOARD_SQUARE_RE = /^[a-h][1-8]$/;

export function isBoardSquare(value: string): boolean {
  return BOARD_SQUARE_RE.test(value);
}

export function squareToId(square: string): number {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]) - 1;
  return rank * 8 + file;
}

export function idToSquare(id: number): string {
  const file = String.fromCharCode("a".charCodeAt(0) + (id % 8));
  const rank = Math.floor(id / 8) + 1;
  return `${file}${rank}`;
}

export function arrowToId(from: string, to: string): number {
  return squareToId(from) * 64 + squareToId(to);
}

export function idToArrow(id: number): [string, string] {
  return [idToSquare(Math.floor(id / 64)), idToSquare(id % 64)];
}
```

## Implementation logic

1. Add the new `lib/blundr` folder.
2. Add enums and helper functions before modifying `app/page.tsx`.
3. Replace local string literals gradually. Do not attempt a full refactor in one patch.
4. Add imports only where needed.
5. Keep existing Attack/Defense/Plan visuals and v2.7.1 trainer behavior intact.

## Pseudocode

```txt
Create contract types.
Create animation enum.
Create concept enum.
Create template dictionary.
Create square/arrow encoding helpers.
Build once.
Do not alter runtime flow yet.
```

## Validation tests

Manual validation:

```bash
npm run build
npm run lint || true
```

Add a simple temporary usage check by importing the files in a harmless place or running TypeScript compile.

Test that unsupported values are rejected:

```ts
isSupportedAnimationPackage("not-real") === false
isSupportedConcept("not-real") === false
isBoardSquare("z9") === false
```

## Acceptance criteria

- `npm run build` passes.
- No duplicate board, component tree, or game state is created.
- All new enums are centralized under `lib/blundr`.
- Context text is template-based.
- No model-facing type allows free-form unsupported animation IDs as trusted values.

## Common failure modes

- Accidentally importing server-only code into `app/page.tsx`.
- Over-refactoring `app/page.tsx` and breaking existing v2.7.1 fixes.
- Allowing model/GPT text to bypass templates.
- Creating enums that do not match existing visual language.

## What not to change

- Do not change `vercel.json` output directory.
- Do not move the board renderer yet.
- Do not remove existing Brain/explorer routes.
- Do not alter Stockfish recommendation logic in this step.
- Do not touch Continue vs Bot, cached tabs, captured pieces, eval display, settings, or game-over UI.
