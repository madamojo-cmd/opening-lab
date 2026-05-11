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

# 10 — Frontend Rendering Handoff

## Objective

Wire the verified Blundr visual output into the existing custom board UI in `app/page.tsx` without breaking v2.7.1 behavior.

The frontend should render final JSON only:

```txt
arrows
squares
animationPackage
context
confidence
debug
```

The frontend should not infer the teaching concept, decide chess moves, or refetch model output when switching Attack/Defense/Plan tabs.

## Current-code integration points

Primary file:

```txt
app/page.tsx
```

Styling:

```txt
app/globals.css
```

Existing features to preserve:

```txt
Attack/Defense/Plan cached views
Temporal Gate overlay
true L-shaped knight moves
selected-piece legal move dots
captured pieces trays
material advantage display
stable eval display
game-over UI
settings panel
move review controls
Continue vs Bot first-click behavior
Stockfish-backed continuation recommendation
```

New API call:

```txt
POST /api/blundr-visual-model
```

## Files to create/modify

Modify:

```txt
app/page.tsx
app/globals.css
```

Do not create a duplicate board.

## Implementation logic

### Add visual model state

In `app/page.tsx`, add state near existing Brain/annotation state:

```ts
const [visualModelOutput, setVisualModelOutput] = useState<BlundrVisualModelOutput | null>(null);
const [visualModelPending, setVisualModelPending] = useState(false);
const [visualModelError, setVisualModelError] = useState<string | null>(null);
const visualRequestSeq = useRef(0);
```

Use the existing request/FEN guard pattern from `runBrain()` if present. Do not create a weaker guard.

### Create stable cache key

```ts
function visualCacheKey(input: {
  normalizedFen: string;
  trainingPhase: string;
  userColor: string;
  expectedActor?: string;
}) {
  return `${input.normalizedFen}|${input.trainingPhase}|${input.userColor}|${input.expectedActor ?? ""}`;
}
```

The active tab must not be part of this key.

### Call the endpoint on position/phase changes only

Dependencies should include:

```txt
currentFen / normalizedFen
moveHistory
trainingPhase / trainingMode-derived phase
userColor
expectedMove
bookStatus
Stockfish best move/eval when available
openingName
```

Dependencies should not include:

```txt
activeAttackDefensePlanTab
settings toggles
hovered square
selected square
```

### Render overlays from output

Map output into existing SVG/Temporal Gate overlay data.

```txt
output.arrows -> path/rail renderer
output.squares -> square highlight renderer
output.animationPackage -> CSS class or visual mode
output.context -> coaching panel
```

### Preserve selected-piece legal moves

Legal selected-piece move dots should remain independent from model visuals.

```txt
selected-piece legal move dots = chess.js legal moves
model highlights = coaching overlay
```

They can render together, but model output must not replace legal move dots.

## Visual mapping

Suggested mapping:

```txt
role: move -> green/primary rail or source-target route
role: pressure -> attack coral/amber
role: defense -> teal/mint
role: future -> blue ghosted
role: threat -> orange/red warning
role: pin -> line tension
```

Square roles:

```txt
source -> source circle
destination -> destination ring
weakness -> amber/orange pulse
center -> blue/green center dot
defense -> teal shield-like glow
danger -> red warning pulse
future -> ghosted blue ring
king_safety -> castle aura
```

Preserve current Temporal Gate style:

```txt
clean rail/path
source circle
destination/target circle
labels on by default
subtle motion
no excessive glow
arrows off by default unless settings allows them
```

## Pseudocode

```txt
useEffect on position/phase key:
  increment requestSeq
  set pending true
  POST /api/blundr-visual-model with current state
  on response:
    if requestSeq stale: ignore
    if response.normalizedFen != current normalizedFen: ignore
    set visualModelOutput
  on error:
    set error but do not crash
  finally:
    if not stale pending false

render board:
  base board
  selected-piece legal move dots
  existing Temporal Gate/model overlay from visualModelOutput
  captured pieces/eval/settings/game-over unchanged

render coaching panel:
  if pending and continuation Stockfish pending -> Engine analyzing...
  else output.context
```

## Validation tests

### Tab caching

```txt
Open a position.
Observe one visual/model request.
Click Attack, Defense, Plan repeatedly.
Expected: no new Brain/model request; visuals switch/cached only.
```

### Stale response

```txt
Trigger visual request.
Quickly make opponent/user move.
Old response returns late.
Expected: ignored; does not overwrite current FEN.
```

### Continuation mode

```txt
Reach Book Complete.
Click Continue vs Bot once.
Expected: enters continuation mode and recommendations are Stockfish-backed.
```

### Legal move dots

```txt
Select a rook/knight/bishop.
Expected: all legal destinations from chess.js show.
Model overlay does not erase them.
```

## Acceptance criteria

- Frontend consumes final `BlundrVisualModelOutput`.
- No duplicate chess board or duplicate legal-move logic.
- Attack/Defense/Plan tab switch does not trigger model/Brain refetch.
- Model unavailable still shows safe rule/fallback visuals.
- All v2.7.1 fixed features remain intact.
- `npm run build` passes.

## Common failure modes

- Active tab added to request dependencies.
- Rendering model overlay instead of legal move dots.
- No stale response guard.
- Broken knight L-shaped path renderer.
- Settings toggles cause model refetch.
- Visual overlay duplicates old Brain annotation rather than replacing/merging safely.

## What not to change

- Do not remove current board renderer.
- Do not remove selected-piece legal move highlights.
- Do not rewrite settings panel.
- Do not change captured pieces/eval/game-over/move-review behavior.
- Do not use random fallback move as visible recommendation.
