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

# 09 — Next.js API Bridge Handoff

## Objective

Create a stable product-facing endpoint:

```txt
POST /api/blundr-visual-model
```

This route builds a feature packet, optionally calls the local model server, decodes/verifies output, applies context templates, and falls back safely to the deterministic rule selector.

The frontend should call this one route instead of directly calling the model service.

## Current-code integration points

Existing routes:

```txt
app/api/brain/route.ts
app/api/explorer/route.ts
```

New route:

```txt
app/api/blundr-visual-model/route.ts
```

Uses:

```txt
lib/blundr/types.ts
lib/blundr/buildFeaturePacket.ts
lib/blundr/ruleVisualSelector.ts
lib/blundr/verifyVisualOutput.ts
lib/blundr/contextTemplates.ts
lib/blundr/squareUtils.ts
```

Environment:

```txt
MODEL_SERVER_URL=http://127.0.0.1:8000
```

## Files to create/modify

### Create `app/api/blundr-visual-model/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import type { BlundrVisualModelRequest, BlundrVisualModelOutput } from "@/lib/blundr/types";
import { buildFeaturePacket } from "@/lib/blundr/buildFeaturePacket";
import { ruleVisualSelector } from "@/lib/blundr/ruleVisualSelector";
import { verifyVisualOutput } from "@/lib/blundr/verifyVisualOutput";
import { renderContextTemplate } from "@/lib/blundr/contextTemplates";
import { idToArrow, idToSquare } from "@/lib/blundr/squareUtils";

const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL;

function decodeModelPrediction(pred: any, packet: any): BlundrVisualModelOutput | null {
  if (!pred || pred.fallbackRequired) return null;

  const concepts = packet.derived.candidateConcepts;
  const animations = packet.derived.candidateAnimations;

  const selectedMove = packet.expectedMove || packet.stockfish.bestMove || packet.derived.candidateMoves[0];
  if (!selectedMove) return null;

  const allowedSquares = new Set(packet.derived.candidateSquares);
  const allowedArrowKeys = new Set(packet.derived.candidateArrows.map(([f, t]: [string, string]) => `${f}-${t}`));

  const squareIds = Array.isArray(pred.squareIds) ? pred.squareIds : [];
  const arrowIds = Array.isArray(pred.arrowIds) ? pred.arrowIds : [];

  const keySquares = squareIds
    .map((id: number) => idToSquare(id))
    .filter((sq: string) => allowedSquares.has(sq))
    .slice(0, 4);

  const arrows = arrowIds
    .map((id: number) => idToArrow(id))
    .filter(([from, to]: [string, string]) => allowedArrowKeys.has(`${from}-${to}`))
    .slice(0, 2)
    .map(([from, to]: [string, string], idx: number) => ({
      from,
      to,
      role: idx === 0 ? "move" : "pressure",
      intensity: idx === 0 ? 1 : 0.7
    }));

  const primaryConcept = concepts[pred.primaryConceptId] ?? "generic_stockfish_best_move";
  const animationPackage = animations[pred.animationPackageId] ?? "quiet-development-glow";
  const templateId = pred.templateId === 0 ? "quiet_development" : "generic_stockfish_best_move";

  return {
    selectedMove,
    selectedView: "move",
    primaryConcept,
    animationPackage,
    keySquares,
    arrows,
    squares: keySquares.map((square: string, idx: number) => ({
      square,
      role: idx === 0 ? "destination" : "soft_target",
      animation: idx === 0 ? "arrival_glow" : "soft_pulse"
    })),
    context: renderContextTemplate(templateId),
    suppress: [],
    confidence: typeof pred.confidence === "number" ? pred.confidence : 0.5,
    debug: {
      source: "blundr_one_net_v0",
      verified: false,
      fallbackUsed: false,
      trainingPhase: packet.trainingPhase,
      expectedActor: packet.expectedActor,
      sideToMove: packet.sideToMove,
      userColor: packet.userColor,
      stockfishBestMove: packet.stockfish.bestMove,
      normalizedFen: packet.normalizedFen
    }
  };
}

async function tryModel(packet: any): Promise<any | null> {
  if (!MODEL_SERVER_URL) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    const res = await fetch(`${MODEL_SERVER_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featurePacket: packet }),
      signal: controller.signal
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BlundrVisualModelRequest & {
      stockfish?: any;
      humanMoves?: any[];
      bookStatus?: any;
      expectedMove?: string;
    };

    const packet = buildFeaturePacket({
      fen: body.fen,
      moveHistory: body.moveHistory ?? [],
      userColor: body.userColor,
      userRatingBucket: body.userRatingBucket ?? "800-1000",
      trainingPhase: body.trainingPhase,
      openingName: body.openingName,
      bookStatus: body.bookStatus,
      expectedMove: body.expectedMove,
      stockfish: body.stockfish,
      humanMoves: body.humanMoves
    });

    const modelPred = await tryModel(packet);
    const decoded = decodeModelPrediction(modelPred, packet);

    if (decoded) {
      const checked = verifyVisualOutput(decoded, packet);
      if (!checked.fallbackRequired && checked.verified) {
        return NextResponse.json(checked.output);
      }
    }

    const ruleOut = ruleVisualSelector(packet);
    const checkedRule = verifyVisualOutput(ruleOut, packet);
    const finalOut = {
      ...checkedRule.output,
      debug: {
        ...(checkedRule.output.debug ?? {}),
        verified: checkedRule.verified,
        fallbackUsed: true,
        warnings: checkedRule.warnings
      }
    };

    return NextResponse.json(finalOut);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "blundr_visual_model_failed",
        message: error?.message ?? "Unknown error"
      },
      { status: 500 }
    );
  }
}
```

Note: adjust import aliases based on existing `tsconfig.json`. If `@/` alias is unavailable, use relative imports.

## Implementation logic

1. Route receives frontend state.
2. Builds feature packet from current FEN and known facts.
3. Calls optional FastAPI model service with a short timeout.
4. Decodes model raw IDs into candidate-bounded JSON.
5. Verifies model JSON.
6. If model fails, calls rule selector.
7. Verifies rule output.
8. Returns final render-ready JSON.

## Important behavior

Model server unavailable must be normal, not fatal.

```txt
No MODEL_SERVER_URL -> rule output
Timeout -> rule output
Model invalid -> rule output
Verifier failure -> rule output
```

## Validation tests

Use curl:

```bash
curl -X POST http://localhost:3000/api/blundr-visual-model \
  -H "Content-Type: application/json" \
  -d '{
    "fen":"r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    "moveHistory":["e4","e5","Nf3","Nc6","Bc4"],
    "userColor":"w",
    "userRatingBucket":"800-1000",
    "trainingPhase":"showing_user_move_feedback",
    "openingName":"Italian Game"
  }'
```

Test with model server off and on.

## Acceptance criteria

- Route works with no model server.
- Route returns final `BlundrVisualModelOutput` shape.
- Route does not call GPT.
- Route does not choose legal moves outside `chess.js` legal moves.
- Route preserves safe fallback behavior.
- `npm run build` passes.

## Common failure modes

- Import alias mismatch.
- Route imports browser-only Stockfish code.
- Model timeout blocks UI too long.
- Decoding IDs without candidate masks.
- Returning raw model IDs to frontend.

## What not to change

- Do not replace `/api/brain` yet.
- Do not make `/api/blundr-visual-model` required for existing Brain flow until frontend integration is tested.
- Do not make Vercel depend on local FastAPI.
- Do not call OpenAI from this route in v0.
