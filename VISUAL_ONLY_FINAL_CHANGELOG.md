# Blundr v2.7 Board-Lab Temporal Gate Final

Base: uploaded `blundr-v2.7-professional-repair`.

Scope: visual-only renderer integration plus existing-pipeline motif metadata.

Changed files:
- app/page.tsx
- app/globals.css
- app/api/brain/route.ts

No changes to:
- package.json
- repertoire/training flow
- progress storage
- Stockfish/Lichess/GPT fallback structure
- navigation
- core move validation

Visual implementation:
- All board lines render through a Board-Lab-style Temporal Gate renderer.
- Timing paths use dashed gate rails, rotating lock gates, lock-step rings, and gate tokens.
- Knight moves preserve L-shaped geometry when pathStyle is `knight-l` or legal knight geometry is inferred from a knight label.
- Attack/defense/plan/opponent remain semantically distinct but share one Temporal Gate visual language.
- Display toggles control motion, labels, gate text, arrows, and motif overlays.

Motif metadata:
- Existing /api/brain pipeline now attaches visual-only metadata for forks, pins, x-rays, hanging targets, and defensive pins.
- This metadata does not replace training logic or change legal move handling.
