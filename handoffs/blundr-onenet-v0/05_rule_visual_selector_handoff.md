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

# 05 — Rule Visual Selector Handoff

## Objective

Build a deterministic rule-based visual selector that produces safe BlundrVisualModelOutput from a feature packet.

This is not a throwaway. It serves four roles:

1. Production-safe fallback when model server is unavailable or output fails verification.
2. Baseline visual coaching system.
3. Synthetic label generator source.
4. Debug comparison against BlundrOneNet v0.

## Current-code integration points

New file:

```txt
lib/blundr/ruleVisualSelector.ts
```

Uses:

```txt
lib/blundr/types.ts
lib/blundr/buildFeaturePacket.ts
lib/blundr/contextTemplates.ts
lib/blundr/verifyVisualOutput.ts
```

Future integration:

```txt
app/api/blundr-visual-model/route.ts
app/page.tsx via API response
model/scripts/generate_labels.py or Node generator equivalent
```

## Files to create/modify

### Create `lib/blundr/ruleVisualSelector.ts`

```ts
import type { BlundrVisualModelOutput, BlundrArrow, BlundrSquare } from "./types";
import type { BlundrFeaturePacket } from "./buildFeaturePacket";
import { renderContextTemplate } from "./contextTemplates";

function moveParts(uci: string): { from: string; to: string } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}

function chooseTeachingMove(packet: BlundrFeaturePacket): string | undefined {
  if (packet.expectedMove && packet.legalMoves.includes(packet.expectedMove)) return packet.expectedMove;
  if (packet.bookStatus === "continuation" && packet.stockfish.bestMove && packet.legalMoves.includes(packet.stockfish.bestMove)) return packet.stockfish.bestMove;
  if (packet.stockfish.bestMove && packet.legalMoves.includes(packet.stockfish.bestMove)) return packet.stockfish.bestMove;
  return packet.derived.candidateMoves.find((m) => packet.legalMoves.includes(m));
}

function baseOutput(packet: BlundrFeaturePacket, selectedMove: string): BlundrVisualModelOutput {
  const { from, to } = moveParts(selectedMove);
  return {
    selectedMove,
    selectedView: "move",
    primaryConcept: "generic_stockfish_best_move",
    animationPackage: "quiet-development-glow",
    keySquares: [from, to],
    arrows: [{ from, to, role: "move", intensity: 1 }],
    squares: [
      { square: from, role: "source", animation: "source_glow" },
      { square: to, role: "destination", animation: "arrival_glow" }
    ],
    context: renderContextTemplate("generic_stockfish_best_move"),
    suppress: [],
    confidence: 0.62,
    debug: {
      source: "rule",
      verified: false,
      fallbackUsed: false,
      stockfishBestMove: packet.stockfish.bestMove,
      stockfishEvalCp: packet.stockfish.evalCp,
      openingName: packet.openingName,
      trainingPhase: packet.trainingPhase,
      expectedActor: packet.expectedActor,
      sideToMove: packet.sideToMove,
      userColor: packet.userColor,
      normalizedFen: packet.normalizedFen
    }
  };
}

export function ruleVisualSelector(packet: BlundrFeaturePacket): BlundrVisualModelOutput {
  const selectedMove = chooseTeachingMove(packet);

  if (!selectedMove) {
    // Caller should treat this as pending if Stockfish is pending, not as a random recommendation.
    return {
      ...baseOutput(packet, packet.legalMoves[0] ?? "0000"),
      primaryConcept: "generic_stockfish_best_move",
      confidence: 0.2,
      suppress: ["recommendation_pending"],
      debug: {
        source: "fallback",
        verified: false,
        fallbackUsed: true,
        warnings: ["No safe teaching move available."],
        trainingPhase: packet.trainingPhase,
        expectedActor: packet.expectedActor,
        sideToMove: packet.sideToMove,
        userColor: packet.userColor,
        normalizedFen: packet.normalizedFen
      }
    };
  }

  const out = baseOutput(packet, selectedMove);
  const { from, to } = moveParts(selectedMove);

  // Bishop/queen diagonal pressure to f7/f2.
  const weakTarget = packet.sideToMove === "w" ? "f7" : "f2";
  const pressureArrowAllowed = packet.derived.candidateArrows.some(([a, b]) => a === to && b === weakTarget);
  if (packet.derived.weakSquares.includes(weakTarget) && pressureArrowAllowed) {
    out.selectedView = "attack";
    out.primaryConcept = packet.sideToMove === "w" ? "development_with_f7_pressure" : "development_with_f2_pressure";
    out.animationPackage = "diagonal-pressure-glow";
    out.keySquares = [from, to, weakTarget];
    out.arrows = [
      { from, to, role: "move", intensity: 1 },
      { from: to, to: weakTarget, role: "pressure", intensity: 0.75 }
    ];
    out.squares = [
      { square: from, role: "source", animation: "source_glow" },
      { square: to, role: "destination", animation: "arrival_glow" },
      { square: weakTarget, role: "weakness", animation: "soft_pulse" }
    ];
    out.context = renderContextTemplate("develop_with_pressure");
    out.confidence = 0.86;
    return out;
  }

  // Knight development and center pressure.
  if (["g1", "b1", "g8", "b8"].includes(from)) {
    out.selectedView = "plan";
    out.primaryConcept = "knight_center_pressure";
    out.animationPackage = "knight-pressure-center";
    out.context = renderContextTemplate("knight_pressure_center");
    out.confidence = 0.82;
    const center = packet.derived.centerSquares.find((sq) => packet.derived.candidateSquares.includes(sq));
    if (center && packet.derived.candidateArrows.some(([a, b]) => a === to && b === center)) {
      out.arrows.push({ from: to, to: center, role: "pressure", intensity: 0.6 });
      out.keySquares = [from, to, center];
      out.squares.push({ square: center, role: "center", animation: "center_dot" });
    }
    return out;
  }

  // Castling.
  if ((from === "e1" && ["g1", "c1"].includes(to)) || (from === "e8" && ["g8", "c8"].includes(to))) {
    out.selectedView = "defense";
    out.primaryConcept = "castle_for_safety";
    out.animationPackage = "castle-safety-aura";
    out.context = renderContextTemplate("castle_for_safety");
    out.squares = [
      { square: from, role: "source", animation: "source_glow" },
      { square: to, role: "king_safety", animation: "safety_aura" }
    ];
    out.confidence = 0.88;
    return out;
  }

  // Central pawn move/break.
  if (["d2", "e2", "d7", "e7"].includes(from) && ["d4", "e4", "d5", "e5"].includes(to)) {
    out.selectedView = "plan";
    out.primaryConcept = "occupy_center";
    out.animationPackage = "center-break-pulse";
    out.context = renderContextTemplate("prepare_center_break");
    out.keySquares = [from, to];
    out.squares.push({ square: to, role: "center", animation: "center_pulse" });
    out.confidence = 0.8;
    return out;
  }

  out.primaryConcept = "quiet_development";
  out.context = renderContextTemplate("quiet_development");
  out.confidence = 0.7;
  return out;
}
```

## Implementation logic

The rule selector should choose a teaching move in this priority order:

```txt
1. Saved repertoire expected move in restricted/book mode.
2. Stockfish best move in continuation mode.
3. Stockfish best move in general when available.
4. Candidate move from feature packet.
5. Emergency fallback only if needed for safe rendering, marked as fallback and not shown as engine recommendation while pending.
```

## Pseudocode

```txt
ruleVisualSelector(packet):
  selectedMove = chooseTeachingMove(packet)
  if none:
    return pending/fallback-safe output

  build move arrow from selectedMove

  if diagonal pressure to weak f7/f2 verified:
    return attack concept output

  if knight develops from back rank:
    return center pressure output

  if castling:
    return king safety output

  if central pawn break:
    return center break output

  return quiet development output
```

## Validation tests

Test positions:

```txt
Italian Bc4 -> diagonal pressure output
Knight Nf3/Nc3/Nf6/Nc6 -> knight center pressure output
O-O/O-O-O -> castle safety output
e4/d4/e5/d5 -> center output
Random quiet move -> quiet development output
Continuation mode with Stockfish bestMove -> selectedMove equals Stockfish bestMove
Restricted mode with expectedMove -> selectedMove equals expectedMove
```

Each output must pass `verifyVisualOutput`.

## Acceptance criteria

- Rule selector returns render-ready JSON compatible with contract.
- Rule selector never calls GPT.
- Rule selector never invents legal moves.
- Rule selector output passes verifier.
- Rule selector can be used when model server fails.
- Continuation mode recommendation remains Stockfish-backed.

## Common failure modes

- Using first legal move when Stockfish is pending and displaying it as recommendation.
- Creating pressure arrows that are not in feature packet candidates.
- Misclassifying opponent context as user recommendation.
- Overcrowding the board with too many arrows/squares.

## What not to change

- Do not modify existing visual overlay rendering in this step.
- Do not replace Brain route.
- Do not change the fixed v2.7.1 continuation behavior.
- Do not make rule selector depend on React components.
