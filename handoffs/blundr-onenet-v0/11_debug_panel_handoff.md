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

# 11 — Debug Panel Handoff

## Objective

Add a development/debug inspection panel that exposes why Blundr is showing a given move, concept, animation, and visual overlay.

This is essential for diagnosing:

```txt
wrong-side bugs
stale response bugs
Stockfish pending/fallback bugs
invalid model output
feature packet gaps
verifier repairs
model server availability
```

## Current-code integration points

Primary file:

```txt
app/page.tsx
```

Potential styling:

```txt
app/globals.css
```

Data sources:

```txt
visualModelOutput.debug
current FEN
normalized FEN
trainingPhase/trainingMode
userColor
sideToMove
expectedActor
Stockfish best move/eval/pending
Brain annotation request ID if available
active tab
settings toggles
```

## Files to create/modify

Recommended same-day path:

```txt
Modify app/page.tsx only.
Optionally add CSS in app/globals.css.
```

If the file is already too large and a `components/` folder now exists, create:

```txt
components/BlundrDebugPanel.tsx
```

Otherwise keep inside `app/page.tsx` to minimize refactor risk.

## Implementation logic

### Add setting/toggle

Use existing settings panel if possible:

```txt
Show Debug Panel
```

Default:

```txt
dev only or false
```

Implementation:

```ts
const [showDebugPanel, setShowDebugPanel] = useState(false);
```

### Debug payload

Create a derived object:

```ts
const debugPayload = {
  fen: currentFen,
  normalizedFen,
  sideToMove,
  userColor,
  trainingPhase,
  trainingMode,
  expectedActor,
  bookStatus,
  expectedMove,
  activeView,
  visualSource: visualModelOutput?.debug?.source,
  confidence: visualModelOutput?.confidence,
  verified: visualModelOutput?.debug?.verified,
  fallbackUsed: visualModelOutput?.debug?.fallbackUsed,
  warnings: visualModelOutput?.debug?.warnings ?? [],
  selectedMove: visualModelOutput?.selectedMove,
  primaryConcept: visualModelOutput?.primaryConcept,
  animationPackage: visualModelOutput?.animationPackage,
  stockfishBestMove: visualModelOutput?.debug?.stockfishBestMove ?? stockfishBestMove,
  stockfishEvalCp,
  visualPending: visualModelPending,
  visualError: visualModelError,
  candidateArrowsCount: visualFeaturePacket?.derived?.candidateArrows?.length,
  candidateSquaresCount: visualFeaturePacket?.derived?.candidateSquares?.length
};
```

Only include available values. Do not break build if some names differ.

### UI display

Display as compact panel:

```txt
Source: rule / model / fallback
Confidence: 0.86
Verified: yes/no
Fallback: yes/no
Training phase
Expected actor
Side to move
User color
Selected move
Stockfish best move
Concept
Animation
Warnings
```

## Pseudocode

```txt
if showDebugPanel:
  render fixed/side panel
  show concise key-value rows
  if warnings exist:
    render warning list
  add copy JSON button optional
```

## CSS guidance

Keep it unobtrusive:

```css
.blundr-debug-panel {
  font-size: 12px;
  line-height: 1.35;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 12px;
  max-height: 360px;
  overflow: auto;
}

.blundr-debug-panel code {
  word-break: break-word;
}
```

Do not introduce a heavy UI dependency.

## Validation tests

Manually verify debug panel in these cases:

```txt
Normal restricted/book position
Book Complete position
Continuation mode with Stockfish best move
Model server unavailable
Verifier repaired unsupported animation
Wrong-side phase mismatch
Attack/Defense/Plan tab switch
```

Expected:

```txt
Panel updates with FEN/phase changes.
Panel does not trigger Brain/model refetch.
Warnings are visible.
Fallback source is visible.
```

## Acceptance criteria

- Debug panel can be toggled.
- It shows source, confidence, verified, fallback, warnings, phase, actor, side-to-move, userColor, selectedMove, Stockfish best move, concept, and animation.
- It does not affect trainer flow.
- It does not trigger model/Brain requests.
- It does not expose API keys or secrets.
- `npm run build` passes.

## Common failure modes

- Debug panel accesses undefined state and crashes.
- Debug panel added to useEffect dependencies and causes refetch loops.
- Panel exposes environment variables/secrets.
- Panel is always visible in production.

## What not to change

- Do not rewrite settings panel.
- Do not alter visual/model decision logic from inside debug UI.
- Do not add debug state to request cache keys.
- Do not expose OpenAI key, Lichess token, or environment secrets.
