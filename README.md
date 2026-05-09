# Blundr v2.1 — GPT Visual Pipeline

This update routes the Intelligent Board through a visible annotation pipeline:

1. Analyze board facts with chess.js and restricted opening context.
2. Send current FEN to the engine route for move impact and candidate continuations.
3. Send verified facts, training target, engine lines, and candidate visual fields to GPT.
4. Receive structured GPT annotation.
5. Validate squares/arrows.
6. Update Attack / Defense / Plan highlights and coaching text.

## Product behavior

- Restricted opening trainer remains the default.
- Wrong legal moves are rejected and logged as review items.
- Opponent opening replies are Lichess-weighted but constrained to the selected opening tree.
- End of book pauses with Train Again / Continue vs Bot.
- Active Board modes are Attack / Defense / Plan.
- GPT controls both verbal coaching and visual annotation from verified candidates.
- Upper-right status indicator above the board shows the live pipeline step.

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

## Deploy

```bash
git add .gitignore .npmrc README.md app public package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.1 GPT Visual Pipeline"
git push
```

## Optional Vercel variables

```text
LICHESS_TOKEN
OPENAI_API_KEY
OPENAI_COACH_MODEL
```
