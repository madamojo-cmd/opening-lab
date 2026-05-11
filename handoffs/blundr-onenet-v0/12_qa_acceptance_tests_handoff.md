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

# 12 — QA Acceptance Tests Handoff

## Objective

Create a final QA checklist and acceptance test plan for BlundrOneNet v0 integration. This must protect the confirmed v2.7.1 fixes while adding the new contract, feature packet, verifier, rule selector, optional model server, API bridge, frontend rendering, and debug panel.

## Current-code integration points

Files likely touched by prior handoffs:

```txt
app/page.tsx
app/globals.css
app/api/blundr-visual-model/route.ts
lib/blundr/*
model/*
```

Existing routes to preserve:

```txt
app/api/brain/route.ts
app/api/explorer/route.ts
```

## Build/deployment checks

Run before manual QA:

```bash
npm run build
cat vercel.json
```

`vercel.json` must not specify `dist` output:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

If model files were added:

```bash
cd model
source .venv/bin/activate || true
python scripts/validate_labels.py || true
python src/evaluate.py || true
```

## Regression tests for fixed A-J behaviors

### A. Wrong-side recommended move bug

Test:

```txt
Play several user/opponent moves quickly.
Wait for delayed Brain/model responses.
```

Expected:

```txt
Old responses do not overwrite current FEN.
No wrong-side recommendation appears.
Debug panel shows current side-to-move and expected actor correctly.
```

### B. Attack/Defense/Plan tab refetching

Test:

```txt
Open a position.
Watch network panel.
Click Attack, Defense, Plan repeatedly.
```

Expected:

```txt
No new /api/brain call.
No new /api/blundr-visual-model call.
Only cached view changes.
```

### C. Continuation phase bug

Test:

```txt
Reach end of saved repertoire.
```

Expected:

```txt
Book Complete appears.
Continue vs Bot is available.
```

### D. Double-click Continue vs Bot bug

Test:

```txt
Click Continue vs Bot once.
```

Expected:

```txt
Continuation starts on first click.
No second click required.
```

### E. Engine recommended move mismatch

Test:

```txt
Enter continuation mode.
Observe recommendation while Stockfish pending and after Stockfish completes.
```

Expected:

```txt
Pending shows Engine analyzing or equivalent.
Final recommendation equals Stockfish top move.
Random legal fallback is not displayed as recommendation.
```

### F. Captured pieces display

Test:

```txt
Play captures for both sides.
Flip orientation if supported.
```

Expected:

```txt
Top/bottom trays reflect captured pieces.
Material advantage displays only side ahead or Equal.
No redundant negative count.
```

### G. Dominance/eval bar display

Test:

```txt
Play positions where eval changes sides.
```

Expected:

```txt
Display says White +x, Black +x, Equal, White mate in n, or Black mate in n.
No confusing plus/minus flipping.
```

### H. Checkmate/end-state UI

Test:

```txt
Load/play checkmate, stalemate, draw, insufficient material.
```

Expected:

```txt
Game Over card appears with reason/result and restart button.
```

### I. Selected-piece legal move highlights

Test:

```txt
Select rook, knight, bishop, queen, king, pawn.
```

Expected:

```txt
All legal destinations from chess.js show.
Captures have capture marker/ring.
No illegal moves show.
Highlights disappear after deselect/move.
```

### J. Settings panel

Test:

```txt
Toggle board theme, piece style, legal moves, eval bar, captured pieces, labels, opponent cue, motion, arrows.
```

Expected:

```txt
UI updates immediately.
No Brain/model reload caused by display-only settings.
Game state remains intact.
```

## BlundrOneNet v0 tests

### Contract/enums

Expected:

```txt
All model outputs use supported concepts, animations, templates, square roles, arrow roles.
Unsupported values are rejected/repaired.
```

### Feature packet

Test positions:

```txt
Start position
Italian: 1.e4 e5 2.Nf3 Nc6
Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5
London: 1.d4 d5 2.Bf4
Caro-Kann: 1.e4 c6
Book-complete position
Continuation position
```

Expected:

```txt
sideToMove correct
expectedActor correct
legalMoves from chess.js
candidateMoves subset of legal moves unless pending
candidateArrows valid
candidateSquares valid
Stockfish best move used in continuation when available
```

### Verifier

Inject bad outputs:

```txt
illegal selectedMove
wrong-side selectedMove
z9 square
unsupported animation
unsupported concept
20 arrows
20 squares
missing context
NaN confidence
```

Expected:

```txt
hard failures trigger fallback
repairable failures are repaired
visual budget enforced
frontend never crashes
```

### Rule selector

Expected:

```txt
Italian Bc4 -> diagonal pressure output
Knight development -> knight center pressure
Castling -> castle safety
Central pawn break -> center concept
Continuation -> Stockfish best move
```

### Model server unavailable

Test:

```txt
Unset MODEL_SERVER_URL or stop FastAPI.
```

Expected:

```txt
/api/blundr-visual-model returns rule output.
App still works.
Debug source shows rule/fallback/model_unavailable.
```

### Model server available

Test:

```txt
Start FastAPI server.
Call /api/blundr-visual-model.
```

Expected:

```txt
Model output is decoded, masked, verified.
If invalid, rule fallback used.
```

## Manual UX acceptance tests

### Italian Game flow

```txt
1.e4 e5 2.Nf3 Nc6
```

Expected:

```txt
Recommended move follows repertoire/engine depending mode.
If Bc4, visual shows source, destination, f7 pressure.
Coaching text is concise and template-based.
```

### User correct move feedback

Expected:

```txt
After user move, explanation matches move just played.
It does not prematurely show opponent's next move as user's move.
```

### Opponent context

Expected:

```txt
After opponent move, app explains what changed and prepares next user decision.
```

### Continue past book

Expected:

```txt
Book Complete -> Continue vs Bot -> Stockfish-backed continuation -> guided plan visuals.
```

## Hard gates

BlundrOneNet integration is not accepted unless:

```txt
Illegal move output after verifier: 0
Wrong-side output after verifier: 0
Invalid square after verifier: 0
Invalid arrow after verifier: 0
Unsupported animation after verifier: 0
Frontend crashes from model output: 0
Random legal fallback displayed as recommendation: 0
Attack/Defense/Plan model refetch on tab switch: 0
```

## Acceptance criteria

- `npm run build` passes.
- Vercel config remains correct.
- v2.7.1 A-J behaviors remain fixed.
- `/api/blundr-visual-model` works with and without model server.
- Rule fallback works.
- Verifier prevents bad output.
- Frontend renders arrows/squares/context from final JSON.
- Debug panel helps diagnose source/confidence/warnings/phase.

## Common failure modes

- Model integration breaks existing Brain cache.
- Active tab causes refetch.
- Local FastAPI failure crashes Vercel/frontend.
- Stockfish pending state replaced with random move.
- Legal move highlights vanish under model overlay.
- Debug panel leaks secrets or triggers rerenders/refetches.

## What not to change

- Do not mark integration complete if any A-J regression appears.
- Do not ship model output without verifier.
- Do not ship a mandatory external model server dependency to Vercel yet.
- Do not let GPT/model decide legal moves.
- Do not remove deterministic fallback.
