# Blundr v2.7 — Professional Repair

This release focuses on making the trainer truthful and reliable rather than adding new visual clutter.

## Major fixes

### 1. Working browser Stockfish without an API

- Uses the `stockfish` package.
- Copies only the browser-safe `stockfish-18-lite-single` JS/WASM files.
- Refuses to copy heavyweight 100MB Stockfish builds.
- No `STOCKFISH_ENDPOINT` is required.
- If Stockfish cannot load, the UI clearly marks engine fallback.

### 2. Current-FEN Lichess data

- `/api/brain` now fetches Lichess moves for the current FEN.
- Stale client-side Lichess moves are no longer trusted.
- Lichess moves are validated against chess.js before GPT sees them.
- Illegal or wrong-turn Lichess moves are dropped.

### 3. Move history state

- The client now stores move history separately instead of calling `game.history()` from FEN.
- GPT receives actual move history, last move, current FEN, and training context.

### 4. Attack and Defense filtering

- Attack no longer forces weak early arrows.
- Attack only shows meaningful targets, f-pawn/king-zone pressure, actual enemy pieces, or named opening motifs.
- Defense no longer shows useless back-rank protection arrows.
- Defense only shows alerts for true opponent pressure, loose pieces, or contested pieces.
- If there is no urgent defense/attack, the app says so cleanly.

### 5. GPT output preservation

- The sanitizer now accepts rich object responses for `visualExplanation`, `planExplanation`, and `nextPlan`.
- GPT’s useful content is no longer discarded just because it returned structured JSON.

### 6. Debug panel retained

- The GPT Debug Cell remains visible for diagnosis.
- It now includes current-FEN Lichess context and sanitized outputs.

## Hardening QA (rule-only visual coach)

- Visual debug hardening and local-only telemetry live in `app/page.tsx`.
- API smoke test instructions are documented in `API_SMOKE_TEST.md`.
- QA acceptance checklist is tracked in `QA_ACCEPTANCE_REPORT.md`.

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

During install, you should see:

```text
[Blundr] Copied Stockfish lite single worker: stockfish-18-lite-single.js, stockfish-18-lite-single.wasm
```

Check file sizes:

```bash
find public/stockfish -size +50M -print
```

This should print nothing.

## Deploy

```bash
git add .gitignore .npmrc README.md app public scripts package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.7 professional repair"
git push
```

## Vercel environment variables

```text
OPENAI_API_KEY
OPENAI_COACH_MODEL
LICHESS_TOKEN
```

Recommended model for now:

```text
OPENAI_COACH_MODEL=gpt-4o-mini
```

No `STOCKFISH_ENDPOINT` is required.
