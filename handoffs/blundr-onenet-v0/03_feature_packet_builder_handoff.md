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

# 03 — Feature Packet Builder Handoff

## Objective

Build a structured feature packet from the existing Blundr trainer state. The model should not receive raw FEN only. It should receive verified chess facts and bounded candidate sets.

The feature packet is the bridge between:

```txt
current app state + chess.js + Stockfish + opening/explorer context
```

and:

```txt
rule selector / verifier / optional model service
```

## Current-code integration points

Primary file to read:

```txt
app/page.tsx
```

Likely existing values/functions:

```txt
current chess.js game instance
current FEN
move history
trainingMode
bookComplete
expectedUserOptions
Stockfish recommendation/eval state
opening/explorer response
Brain annotation state
userColor / board orientation
```

New file:

```txt
lib/blundr/buildFeaturePacket.ts
```

Support files:

```txt
lib/blundr/types.ts
lib/blundr/trainingStateMachine.ts
lib/blundr/squareUtils.ts
lib/blundr/animationPackages.ts
lib/blundr/concepts.ts
```

## Files to create/modify

### Create `lib/blundr/buildFeaturePacket.ts`

```ts
import { Chess } from "chess.js";
import type { Color, ExpectedActor, TrainingPhase } from "./types";
import { expectedActorForPhase, expectedMoveColorForActor } from "./trainingStateMachine";

export type StockfishSummary = {
  bestMove?: string;
  evalCp?: number;
  mate?: number;
  pv?: string[];
  multiPV?: { move: string; evalCp?: number; mate?: number; pv: string[] }[];
  pending?: boolean;
};

export type HumanExplorerMove = {
  move: string;
  frequency?: number;
  ratingBucket?: string;
};

export type BlundrFeaturePacket = {
  fen: string;
  normalizedFen: string;
  moveHistory: string[];
  sideToMove: Color;
  userColor: Color;
  expectedMoveColor?: Color;
  expectedActor: ExpectedActor;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  openingName?: string;
  bookStatus?: "in_book" | "book_complete" | "continuation";
  expectedMove?: string;
  legalMoves: string[];
  stockfish: {
    bestMove?: string;
    evalCp?: number;
    mate?: number;
    pv: string[];
    multiPV: { move: string; evalCp?: number; mate?: number; pv: string[] }[];
    pending?: boolean;
  };
  human?: {
    commonMoves: HumanExplorerMove[];
  };
  derived: {
    candidateMoves: string[];
    candidateArrows: [string, string][];
    candidateSquares: string[];
    candidateConcepts: string[];
    candidateAnimations: string[];
    centerSquares: string[];
    weakSquares: string[];
    attackedSquares: string[];
    defendedSquares: string[];
    kingDangerSquares: string[];
    pinnedPieces: string[];
    pawnBreaks: string[];
    isDevelopmentPosition: boolean;
    castlingAvailable: boolean;
    queenOutEarly: boolean;
    samePieceMovedTwice: boolean;
    lastMove?: { from: string; to: string; san?: string; uci?: string; by?: ExpectedActor };
  };
  debug: {
    builtAt: string;
    source: "buildFeaturePacket";
    warnings: string[];
  };
};
```

## Implementation details

### Normalized FEN

Normalize FEN by dropping halfmove/fullmove counters if the current Brain cache uses that approach. Use consistent normalization everywhere.

```ts
export function normalizeFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}
```

### Legal move extraction

Use `chess.js` only:

```ts
const game = new Chess(fen);
const legalMovesVerbose = game.moves({ verbose: true });
const legalMoves = legalMovesVerbose.map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
```

### Candidate moves

Priority:

```txt
1. Saved repertoire expected move when in restricted/book mode.
2. Stockfish best move in continuation mode.
3. Stockfish MultiPV moves if available.
4. Lichess/common human moves if legal.
5. Legal moves only as emergency candidates, not user-facing recommendations.
```

Do not display random legal fallback as recommendation.

### Candidate arrows

Always include candidate move arrows:

```ts
for each candidateMove:
  from = move.slice(0, 2)
  to = move.slice(2, 4)
  candidateArrows.add([from, to])
```

Add simple concept arrows:

```txt
Bishop/queen diagonal pressure to f7/f2 when geometrically valid.
Knight pressure to e5/d5/e4/d4 when relevant.
Pin line arrows only if derived support exists.
Castling king move arrow.
Center pawn break arrow.
```

### Candidate squares

Include:

```txt
source/destination squares for candidate moves
center squares d4/e4/d5/e5
f7/f2 when weak-square logic applies
squares attacked by candidate developed piece
Stockfish PV destination squares
castling destination squares
pawn break squares
```

Deduplicate and cap only later during output verification, not here.

## Build function signature

```ts
export function buildFeaturePacket(input: {
  fen: string;
  moveHistory: string[];
  userColor: Color;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  openingName?: string;
  bookStatus?: "in_book" | "book_complete" | "continuation";
  expectedMove?: string;
  stockfish?: StockfishSummary;
  humanMoves?: HumanExplorerMove[];
  lastMove?: { from: string; to: string; san?: string; uci?: string; by?: ExpectedActor };
}): BlundrFeaturePacket
```

## Pseudocode

```txt
buildFeaturePacket(input):
  create chess.js game from FEN
  sideToMove = game.turn()
  expectedActor = input.expectedActor ?? expectedActorForPhase(trainingPhase)
  expectedMoveColor = expectedMoveColorForActor(expectedActor, userColor)

  legalMoves = chess.js legal verbose converted to UCI
  candidateMoves = []

  if book/restricted and expectedMove legal:
    add expectedMove
  if continuation and stockfish.bestMove legal:
    add stockfish.bestMove
  add stockfish MultiPV legal moves
  add legal human/explorer moves

  if candidateMoves empty and stockfish pending:
    do not invent recommendation; mark pending
  if candidateMoves empty emergency:
    add first legal move only for fallback with warning

  derive source/destination squares and arrows
  derive weak f7/f2 squares
  derive center squares and pawn breaks
  derive castling availability
  derive concept and animation candidates

  return packet
```

## Validation tests

Use known positions:

```txt
Start position
Italian: 1.e4 e5 2.Nf3 Nc6
Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5
London: 1.d4 d5 2.Bf4
Caro-Kann: 1.e4 c6
Continuation mode position with Stockfish pending
Book-complete position with no expected move
```

For each packet check:

```txt
legalMoves all legal
candidateMoves subset of legalMoves unless pending
candidateArrows contain only valid board squares
candidateSquares contain only valid board squares
expectedActor matches trainingPhase
expectedMoveColor matches userColor/opponent where applicable
```

## Acceptance criteria

- Packet builds from current `app/page.tsx` state without duplicating game state.
- Legal moves come only from `chess.js`.
- Continuation recommendations prioritize Stockfish best move.
- Candidate arrows/squares are broad enough for visual model but bounded.
- `npm run build` passes.

## Common failure modes

- Using SAN where UCI is expected.
- Treating Stockfish pending as permission to show random legal fallback.
- Missing promotions in legal move encoding.
- Recomputing packet on Attack/Defense/Plan tab switch.
- Candidate arrows not matching verifier expectations.

## What not to change

- Do not replace the existing Stockfish worker.
- Do not replace `/api/explorer`.
- Do not let GPT choose moves.
- Do not make the frontend infer new chess concepts from scratch.
- Do not display fallback legal move as recommendation while engine is pending.
