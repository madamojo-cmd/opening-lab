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

# 06 — Synthetic Label Generation Handoff

## Objective

Create the first verified synthetic dataset for BlundrOneNet v0. The labels should teach the model to imitate safe visual/coaching decisions, not to play chess.

The dataset should contain feature packets plus verified labels:

```txt
FEN + opening context + legal moves + Stockfish/best move + derived candidates -> verified visual/context label
```

## Current-code integration points

Current app remains Next.js-only. The Python/model folder does not yet exist.

New folders/files:

```txt
model/
  README.md
  requirements.txt
  data/
    enums.json
    labels_v0.jsonl
  scripts/
    generate_positions.py
    generate_labels.py
    validate_labels.py
```

Optional Node bridge later:

```txt
scripts/export-blundr-labels.ts
```

## Files to create/modify

### Create `model/requirements.txt`

```txt
python-chess
pydantic
numpy
pandas
```

Optional, if using OpenAI for label refinement:

```txt
openai
python-dotenv
```

Optional, if running Stockfish from Python:

```txt
stockfish
```

### Create `model/data/enums.json`

Mirror TypeScript enums:

```json
{
  "views": ["move", "attack", "defense", "plan", "continuation", "mistake"],
  "concepts": [
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
  ],
  "animations": [
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
  ],
  "templates": [
    "quiet_development",
    "develop_with_pressure",
    "knight_pressure_center",
    "castle_for_safety",
    "prepare_center_break",
    "generic_stockfish_best_move"
  ],
  "warnings": ["none", "queen_danger", "king_danger", "hanging_piece", "tactical_warning"]
}
```

## Position generation scope

Do not process massive Lichess databases today.

Start with curated v0 opening lines:

```txt
Italian Game
Ruy Lopez
Four Knights
Scotch
London System
Queen's Gambit
Caro-Kann
French Defense
Scandinavian Defense
Basic Sicilian
King's Indian setup
```

Generate positions from:

```txt
main lines
common beginner deviations
common opponent replies
4 to 10 plies deep
white and black userColor variants
rating buckets: 600-800, 800-1000, 1000-1200
trainingPhase variants: awaiting_user_move, guided_continuation
```

## Label generation rules

Labels should be generated from:

```txt
chess rules
Stockfish best move if available
board-derived candidates
rule selector logic
optional LLM selection constrained to candidates
verifier
```

Same-day path:

```txt
Use deterministic Python rule labeler first.
Add optional OpenAI synthetic refinement only after deterministic labels work.
```

## Label JSONL schema

Each row:

```json
{
  "id": "italian_000001",
  "fen": "...",
  "normalizedFen": "...",
  "moveHistory": ["e4", "e5", "Nf3", "Nc6"],
  "userColor": "w",
  "userRatingBucket": "800-1000",
  "trainingPhase": "awaiting_user_move",
  "openingName": "Italian Game",
  "featurePacket": {},
  "label": {
    "selectedMove": "f1c4",
    "selectedView": "attack",
    "primaryConcept": "development_with_f7_pressure",
    "animationPackage": "diagonal-pressure-glow",
    "keySquares": ["f1", "c4", "f7"],
    "arrows": [
      { "from": "f1", "to": "c4", "role": "move", "intensity": 1.0 },
      { "from": "c4", "to": "f7", "role": "pressure", "intensity": 0.75 }
    ],
    "squares": [
      { "square": "f1", "role": "source", "animation": "source_glow" },
      { "square": "c4", "role": "destination", "animation": "arrival_glow" },
      { "square": "f7", "role": "weakness", "animation": "soft_pulse" }
    ],
    "templateId": "develop_with_pressure",
    "nextPlanId": "castle_then_center",
    "warningId": "none",
    "confidence": 0.9
  },
  "labelWeight": 1.0,
  "verified": true
}
```

## Pseudocode for `generate_positions.py`

```txt
Define curated opening move lists.
For each opening:
  start chess.Board()
  push moves one by one
  after each ply where side-to-move should be taught:
    emit FEN, moveHistory, openingName, userColor variants, rating bucket variants
Write positions_v0.jsonl
```

## Pseudocode for `generate_labels.py`

```txt
for row in positions:
  board = chess.Board(row.fen)
  legal_uci = list legal moves
  selectedMove = stockfish best if available else curated expected move else simple rule preference
  build candidate arrows/squares
  assign concept:
    bishop to c4 attacking f7 -> development_with_f7_pressure
    bishop to c5 attacking f2 -> development_with_f2_pressure
    knight from back rank -> knight_center_pressure
    castling -> castle_for_safety
    central pawn move -> occupy_center / prepare_center_break
    else quiet_development
  build label
  verify label against legal moves/candidates/enums
  if verified: write labels_v0.jsonl
```

## Optional OpenAI synthetic labeler

Only after deterministic labels pass validation.

Prompt constraints:

```txt
Choose only from provided candidate moves, arrows, squares, concepts, animations, and templates.
Return strict JSON.
Do not invent legal moves, tactics, mates, checks, evaluations, opening names, or coordinates.
Prefer beginner-friendly visual clarity over completeness.
```

Do not store API keys in repo. Use `.env.local` or environment variables.

## Validation tests

Run:

```bash
cd model
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/generate_positions.py
python scripts/generate_labels.py
python scripts/validate_labels.py
```

Validation checks:

```txt
all selectedMove values are legal
all arrows use valid board squares
all arrows are in featurePacket.derived.candidateArrows
all squares are in featurePacket.derived.candidateSquares
all concepts/animations/templates are enum values
labelWeight in [0, 1]
verified == true for training rows
```

## Acceptance criteria

- `model/data/labels_v0.jsonl` exists.
- At least 500 verified labels are generated for v0.
- No illegal moves.
- No invalid coordinates.
- No unsupported enum IDs.
- Dataset can be consumed by model training.

## Common failure modes

- SAN/UCI mismatch.
- Python label schema diverges from TypeScript contract.
- LLM invents arrows or tactics.
- Stockfish unavailable and generator silently uses random legal moves as “best.”
- Missing promotion handling.

## What not to change

- Do not modify the production trainer while generating labels.
- Do not commit `.env` secrets.
- Do not use unverified LLM labels for training.
- Do not process full Lichess data today.
- Do not train a free-form text model.
