# Blundr v2.4 — Built-in Stockfish Worker

This build adds built-in browser Stockfish so you do not need a Stockfish API.

## What changed

- Adds the `stockfish` npm package.
- During `npm install`, `scripts/copy-stockfish.js` copies browser worker files into `public/stockfish`.
- The client runs Stockfish locally in a Web Worker before calling `/api/brain`.
- `/api/brain` prioritizes `clientEngine` results from browser Stockfish.
- If browser Stockfish is unavailable, the app falls back to the existing engine-style analysis and clearly labels that fallback.
- GPT still receives verified Attack / Defense / Plan candidates and returns the final visual + verbal annotation.
- No `STOCKFISH_ENDPOINT` is required.

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

During install you should see a message like:

```text
[Blundr] Copied Stockfish worker: stockfish-18-lite-single.js
```

## Deploy

```bash
git add .gitignore .npmrc README.md app public scripts package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.4 Built-in Stockfish"
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

`STOCKFISH_ENDPOINT` is no longer required. You can add it later for deeper server-side analysis if desired.
