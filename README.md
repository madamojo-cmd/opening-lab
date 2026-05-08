# Blundr v1.1 — Active Board Visual Engine

This deployable update adds an **Active Board** toggle to the training screen.

When Active Board is ON, the board overlays:

- attacked squares from the last moved piece
- protected/defended friendly pieces
- weak or important squares
- hanging pieces
- pins
- forks
- skewers
- discovered attacks
- overloaded defenders
- plan arrows
- concise move/plan/threat commentary

The implementation is local-first and production-safe:

- chess.js is the verified board-fact engine
- Stockfish/engine lines are used as candidate targets when available
- existing AI Coach remains available for deeper structured explanations
- overlays are generated client-side for speed and cost control
- the Active Board setting is saved in localStorage

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Commit and push to GitHub. Vercel will deploy the Next.js app.

```bash
git add .
git commit -m "Add Active Board visual engine"
git push
```
