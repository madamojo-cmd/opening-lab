# Blundr v2.3 — Super Trainer

This deployment builds on v2.2 and upgrades the Active Board into a more advanced teaching system.

## What changed

- `/api/brain` now builds stronger real candidate maps before GPT is called.
- Attack is generated from real pressure: captures, threatened enemy pieces, and meaningful opening targets.
- Defense is generated from real defensive data: protected pieces, loose pieces, opponent threats, and defensive lines.
- Plan remains anchored to the restricted expected training move, then engine/opening context if the book ends.
- GPT receives all verified Attack / Defense / Plan candidates and returns the final visual + verbal annotation.
- The client pauses persistent board overlays until the Brain endpoint returns the final validated visual.
- Opponent move cue still appears immediately and fades after 2.5 seconds.
- Restricted trainer remains the default and wrong legal moves are rejected/logged for review.

## Core product behavior

- Restricted opening training: user must play approved opening moves.
- Opponent replies are Lichess-weighted but constrained to the selected opening tree.
- End-of-book pause: Train Again / Continue vs Bot.
- Continuation mode accepts legal moves and evaluates them.
- Active Board: Attack / Defense / Plan.
- Live Brain and upper-right pipeline indicators show what is happening.

## Install

```bash
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

## Deploy

```bash
git add .gitignore .npmrc README.md app public package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs next-env.d.ts
git commit -m "Add Blundr v2.3 Super Trainer"
git push
```

## Vercel environment variables

```text
OPENAI_API_KEY
OPENAI_COACH_MODEL
LICHESS_TOKEN
STOCKFISH_ENDPOINT
```

Recommended first model:

```text
OPENAI_COACH_MODEL=gpt-4o-mini
```

`STOCKFISH_ENDPOINT` is optional. If omitted, the Brain endpoint uses a clearly labeled engine-style fallback.
