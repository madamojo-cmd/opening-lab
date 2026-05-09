# Blundr v2.5 — Lightweight Stockfish + Board Coordinates + Dominance Bar

This build fixes the browser Stockfish issue by switching from the heavyweight `stockfish` package to lightweight `stockfish.wasm`.

## What changed

- Replaces `stockfish` with `stockfish.wasm`.
- During `npm install`, `scripts/copy-stockfish.js` copies:
  - `stockfish.js`
  - `stockfish.wasm`
  - `stockfish.worker.js`
- These files are small enough for GitHub and Vercel.
- The client runs Stockfish locally in a browser Web Worker before calling `/api/brain`.
- `/api/brain` prioritizes `clientEngine` results from browser Stockfish.
- If browser Stockfish is unavailable, the app falls back to internal engine-style analysis and clearly labels that fallback.
- Adds board coordinates:
  - files along the bottom
  - ranks along the left
  - orientation-aware for white/black
- Adds a chess.com-style dominance/evaluation bar:
  - black advantage grows from the top
  - white advantage grows from the bottom
  - label shows the current engine estimate

## Core product behavior

- Restricted opening trainer remains default.
- Wrong legal moves are rejected and logged as review items.
- Opponent moves are Lichess-weighted but constrained to the selected opening tree.
- Book-complete pause: Train Again / Continue vs Bot.
- Continuation mode accepts legal moves and evaluates them.
- Active Board: Attack / Defense / Plan.
- Opponent cue fades after 2.5 seconds.
- Persistent board overlays wait until Brain returns the final validated visual.

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

During install you should see:

```text
[Blundr] Copied stockfish.wasm browser worker: stockfish.js, stockfish.wasm, stockfish.worker.js
```

Verify no huge files:

```bash
find public/stockfish -size +5M -print
```

That command should print nothing.

## Deploy

```bash
git add .gitignore .npmrc README.md app public scripts package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.5 lightweight Stockfish and board UI"
git push
```

## Vercel environment variables

```text
OPENAI_API_KEY
OPENAI_COACH_MODEL
LICHESS_TOKEN
```

Recommended fast first model:

```text
OPENAI_COACH_MODEL=gpt-4o-mini
```

No `STOCKFISH_ENDPOINT` is required.
