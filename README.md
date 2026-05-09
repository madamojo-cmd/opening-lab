# Blundr v2.2 — Brain Endpoint

This is the cleaner v2.2 architecture.

## Core behavior

- The client calls one `/api/brain` endpoint for the Intelligent Board.
- `/api/brain` performs:
  1. chess.js position facts
  2. engine or engine-style fallback analysis
  3. structured GPT call
  4. validation of visual squares/arrows
  5. final Attack / Defense / Plan annotation
- The client renders the Brain annotation as the source of truth.
- Restricted opening training remains default.
- Wrong legal moves are rejected and logged as review items.
- Opponent moves are Lichess-weighted but constrained to the selected opening tree.
- Reveal Next Move is central.
- Pipeline status above the board shows the live sequence.
- If `OPENAI_API_KEY` is missing, the app clearly marks GPT as fallback.

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

## Deploy

```bash
git add .gitignore .npmrc README.md app public package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.2 Brain Endpoint"
git push
```

## Optional Vercel variables

```text
OPENAI_API_KEY
OPENAI_COACH_MODEL
LICHESS_TOKEN
STOCKFISH_ENDPOINT
```

`STOCKFISH_ENDPOINT` is optional. If omitted, `/api/brain` uses a clearly labeled engine-style fallback.
