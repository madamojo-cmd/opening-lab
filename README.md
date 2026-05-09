# Blundr v2.6.1 — GPT Debug + Expert Coach

This build is for diagnosing why the trainer may be giving weak or confusing guidance.

## What changed

- Adds a live **GPT Debug Cell** in the trainer screen.
- The debug cell shows:
  - pipeline status
  - system prompt
  - exact structured input sent to GPT
  - raw GPT output
  - parsed GPT output
  - sanitized board annotation actually rendered by the app
- `/api/brain` now returns debug data with every response.
- GPT coaching is now instructed to always use expert-level chess guidance.
- Rating pool still controls Lichess/opponent context and engine skill, but GPT is instructed not to dumb down or weaken chess advice.
- Plan is instructed to explicitly distinguish:
  - restricted training move
  - engine-preferred move
  - fallback opening plan

## Existing v2.5 features preserved

- Lightweight `stockfish.wasm`
- Browser Stockfish worker
- Board coordinates
- White/black dominance bar
- Restricted trainer
- Lichess-weighted opponent replies
- Attack / Defense / Plan Active Board
- Review mistake logging

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

## Deploy

```bash
git add .gitignore .npmrc README.md app public scripts package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.6.1 GPT debug and expert coach"
git push
```

## Vercel environment variables

```text
OPENAI_API_KEY
OPENAI_COACH_MODEL
LICHESS_TOKEN
```

Recommended fast model:

```text
OPENAI_COACH_MODEL=gpt-4o-mini
```

No `STOCKFISH_ENDPOINT` is required.
