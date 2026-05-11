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

# 04 — Verifier Handoff

## Objective

Create a deterministic verifier that sits between all visual/coaching producers and the frontend:

```txt
rule selector output
LLM synthetic labels
neural model prediction
fallback output
```

The verifier must guarantee that bad outputs cannot reach the user. After the verifier, the app must have zero illegal moves, zero wrong-side moves, zero invalid squares/arrows, and zero unsupported animation IDs.

## Current-code integration points

New file:

```txt
lib/blundr/verifyVisualOutput.ts
```

Uses:

```txt
lib/blundr/types.ts
lib/blundr/buildFeaturePacket.ts
lib/blundr/animationPackages.ts
lib/blundr/concepts.ts
lib/blundr/contextTemplates.ts
lib/blundr/squareUtils.ts
```

Future callers:

```txt
lib/blundr/ruleVisualSelector.ts
app/api/blundr-visual-model/route.ts
model label-generation tooling
app/page.tsx defensive checks if needed
```

## Files to create/modify

### Create `lib/blundr/verifyVisualOutput.ts`

```ts
import type { BlundrVisualModelOutput } from "./types";
import type { BlundrFeaturePacket } from "./buildFeaturePacket";
import { isSupportedAnimationPackage } from "./animationPackages";
import { isSupportedConcept } from "./concepts";
import { isBoardSquare } from "./squareUtils";
import { renderContextTemplate } from "./contextTemplates";

export type VerificationResult = {
  verified: boolean;
  output: BlundrVisualModelOutput;
  warnings: string[];
  repaired: boolean;
  fallbackRequired: boolean;
};

const MAX_ARROWS = 2;
const MAX_KEY_SQUARES = 4;
const MAX_SQUARES = 4;

function arrowKey(from: string, to: string) {
  return `${from}-${to}`;
}

export function verifyVisualOutput(
  output: BlundrVisualModelOutput,
  packet: BlundrFeaturePacket
): VerificationResult {
  const warnings: string[] = [];
  let repaired = false;
  let fallbackRequired = false;

  const allowedArrows = new Set(packet.derived.candidateArrows.map(([f, t]) => arrowKey(f, t)));
  const allowedSquares = new Set(packet.derived.candidateSquares);
  const legalMoves = new Set(packet.legalMoves);

  let next: BlundrVisualModelOutput = {
    ...output,
    arrows: Array.isArray(output.arrows) ? [...output.arrows] : [],
    squares: Array.isArray(output.squares) ? [...output.squares] : [],
    keySquares: Array.isArray(output.keySquares) ? [...output.keySquares] : [],
    suppress: Array.isArray(output.suppress) ? [...output.suppress] : [],
    debug: {
      ...(output.debug ?? {}),
      verified: false,
      fallbackUsed: output.debug?.fallbackUsed ?? false,
      trainingPhase: packet.trainingPhase,
      expectedActor: packet.expectedActor,
      sideToMove: packet.sideToMove,
      userColor: packet.userColor,
      normalizedFen: packet.normalizedFen,
      stockfishBestMove: packet.stockfish.bestMove,
      openingName: packet.openingName
    }
  };

  if (!legalMoves.has(next.selectedMove)) {
    warnings.push(`Illegal selectedMove: ${next.selectedMove}`);
    fallbackRequired = true;
  }

  if (packet.expectedMoveColor && packet.expectedMoveColor !== packet.sideToMove) {
    warnings.push(`Phase/color mismatch: expected ${packet.expectedMoveColor}, FEN has ${packet.sideToMove}`);
    fallbackRequired = true;
  }

  if (!isSupportedAnimationPackage(next.animationPackage)) {
    warnings.push(`Unsupported animation package: ${next.animationPackage}`);
    next.animationPackage = "quiet-development-glow";
    repaired = true;
  }

  if (!isSupportedConcept(next.primaryConcept)) {
    warnings.push(`Unsupported concept: ${next.primaryConcept}`);
    next.primaryConcept = "generic_stockfish_best_move";
    repaired = true;
  }

  next.keySquares = next.keySquares.filter((sq) => {
    const ok = isBoardSquare(sq) && allowedSquares.has(sq);
    if (!ok) warnings.push(`Rejected key square: ${sq}`);
    return ok;
  }).slice(0, MAX_KEY_SQUARES);

  next.squares = next.squares.filter((item) => {
    const ok = isBoardSquare(item.square) && allowedSquares.has(item.square);
    if (!ok) warnings.push(`Rejected square highlight: ${item.square}`);
    return ok;
  }).slice(0, MAX_SQUARES);

  next.arrows = next.arrows.filter((arrow) => {
    const ok =
      isBoardSquare(arrow.from) &&
      isBoardSquare(arrow.to) &&
      allowedArrows.has(arrowKey(arrow.from, arrow.to));
    if (!ok) warnings.push(`Rejected arrow: ${arrow.from}-${arrow.to}`);
    return ok;
  }).slice(0, MAX_ARROWS);

  if (!next.context || !next.context.headline) {
    warnings.push("Missing context; repaired with generic template.");
    next.context = renderContextTemplate("generic_stockfish_best_move");
    repaired = true;
  }

  next.confidence = Number.isFinite(next.confidence)
    ? Math.max(0, Math.min(1, next.confidence))
    : 0.5;

  const verified = !fallbackRequired && warnings.filter(w => w.startsWith("Illegal") || w.includes("mismatch")).length === 0;
  next.debug = {
    ...(next.debug ?? {}),
    verified,
    warnings,
    fallbackUsed: next.debug?.fallbackUsed ?? false
  };

  return { verified, output: next, warnings, repaired, fallbackRequired };
}
```

## Implementation logic

The verifier should not be clever. It should be conservative.

### Hard failure triggers

```txt
selectedMove illegal
selectedMove wrong side / phase-color mismatch
no legal move exists in position
model output missing required shape
```

### Repairable triggers

```txt
unsupported animation -> replace with safe animation
unsupported concept -> generic_stockfish_best_move
excess arrows -> cap to 2
excess squares -> cap to 4
invalid arrow/square -> remove
missing context -> template fallback
confidence outside 0-1 -> clamp
```

### Fallback behavior

If `fallbackRequired` is true, caller should call `ruleVisualSelector(packet)` or a dedicated `buildFallbackOutput(packet)`.

Do not let verifier itself import rule selector if that creates circular imports.

## Pseudocode

```txt
verify(output, packet):
  validate selectedMove in packet.legalMoves
  validate expectedMoveColor equals packet.sideToMove if actor expects a move
  validate animationPackage in enum
  validate concept in enum
  filter keySquares by board square + candidateSquares
  filter squares by board square + candidateSquares
  filter arrows by board square + candidateArrows
  cap visual budget
  repair missing context
  attach debug warnings
  return result
```

## Validation tests

Create a small test script or manual test block that passes intentionally bad output:

```txt
selectedMove = e2e5 when illegal
selectedMove for wrong side
arrow = a1-z9
square = z9
animationPackage = fake-animation
primaryConcept = fake-concept
20 arrows
20 squares
missing context
NaN confidence
```

Expected:

```txt
illegal/wrong-side -> fallbackRequired
invalid arrows/squares -> removed
unsupported IDs -> repaired
visual budget enforced
context repaired
no frontend crash
```

## Acceptance criteria

- Verifier can be used by rule selector, model bridge, and label-generation pipeline.
- After verification, frontend receives only valid board squares and allowed arrows.
- Unsupported model values do not break rendering.
- Wrong-side output cannot pass.
- `npm run build` passes.

## Common failure modes

- Verifier is too permissive and allows arrows not in candidates.
- Verifier is too strict and rejects every useful pressure arrow because feature packet did not include it.
- Circular imports between verifier and fallback selector.
- Using SAN moves instead of UCI legal move strings.

## What not to change

- Do not display the model output before verification.
- Do not let verifier call GPT.
- Do not make verifier depend on React state.
- Do not remove existing stale-response protection.
- Do not relax wrong-side checks for convenience.
