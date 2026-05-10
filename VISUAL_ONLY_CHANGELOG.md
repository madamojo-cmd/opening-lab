# Blundr v2.7 Temporal Gate Visual Package

Base: uploaded `blundr-v2.7-professional-repair`.

This deployment intentionally preserves the v2.7 trainer flow, app architecture, repertoire logic, Stockfish/Lichess/GPT pipeline, local progress storage, and navigation.

## Changed files

- `app/page.tsx`
  - Replaced the board overlay renderer with the unified Temporal Gate visual package.
  - All attack, defense, plan, and opponent lines now render through the same Temporal Gate visual language.
  - Knight geometry is preserved as L-shaped paths when the line is explicitly `pathStyle: "knight-l"` or can be safely inferred from legal knight geometry and label text.
  - Added visual-only toggles for Motion, Labels, Gate Text, Arrows, and Auto Motifs.

- `app/globals.css`
  - Added Temporal Gate animation keyframes and SVG text/label styling.

- `app/api/brain/route.ts`
  - Extended the existing visual-line metadata to carry optional visual fields: `pathStyle`, `gateState`, `timing`, and `motif`.
  - Added lightweight chess-geometry motif labeling inside the existing Brain candidate pipeline for forks, pins, x-rays, hanging targets, and defensive pin alerts.
  - This does not change move legality, training behavior, repertoire mode, or engine/GPT/Lichess structure.

## Deployment

```bash
rm -rf .next node_modules
npm install --registry=https://registry.npmjs.org/
npm run dev
```

Vercel: Next.js preset, `npm install`, `npm run build`, no output directory.
