# AI Agent Instructions for opening-lab

This repository is a Next.js + TypeScript project centered on a chess coaching/training app called Blundr.
Use this file as the first reference for build commands, architecture, and important conventions before making changes.

## Build / run / test

- Install dependencies: `npm install --registry=https://registry.npmjs.org/`
- Copy browser-safe Stockfish assets: `npm run postinstall` (or `npm run copy-stockfish`)
- Local development: `npm run dev`
- Production build: `npm run build`
- Production start: `npm run start`
- Coach-quality test: `npm run test:coach-quality`
- Trainer debug test: `npm run test:trainer-debug`
- Multi-move QA test: `npm run test:multi-move-qa`

## High-level architecture

- `app/` contains the Next.js app-router UI and server API endpoints.
  - `app/page.tsx` is the main UI page.
  - `app/layout.tsx` defines the app shell.
  - `app/api/brain/`, `app/api/blundr-visual-model/`, and `app/api/explorer/` are server routes for runtime coaching, visual model data, and exploration.
  - `app/globals.css` contains global styling.

- `lib/blundr/` contains the core chess coaching logic, analysis features, and debug utilities.
  - `lib/blundr/coach*` and `lib/blundr/coaching/` implement coach behavior and reasoning.
  - `lib/blundr/debug/` contains local QA and trainer debug helpers.
  - `lib/blundr/engine/`, `lib/blundr/explanation/`, `lib/blundr/visual/`, and related folders hold key chess analysis, visual selection, and explanation logic.

- `public/stockfish/` holds the browser-safe Stockfish worker files copied by `scripts/copy-stockfish.js`.
- `scripts/copy-stockfish.js` is essential for installing and running the browser Stockfish engine.

## Important conventions

- This project is designed to use the `stockfish` npm package and browser-safe Stockfish assets only.
  - Do not introduce heavyweight Stockfish binaries to `public/stockfish`.
  - Verify that `find public/stockfish -size +50M -print` prints nothing after copying assets.

- Environment variables referenced in `README.md`:
  - `OPENAI_API_KEY`
  - `OPENAI_COACH_MODEL` (recommended: `gpt-4o-mini`)
  - `LICHESS_TOKEN`

- The app does not require `STOCKFISH_ENDPOINT`.
- The current release is focused on truthfulness and reliability over added visual clutter.
- The `README.md` is the primary project documentation and should be linked instead of duplicated.

## What to change here

- Add guidance for new, project-specific conventions that are not documented in `README.md`.
- Avoid duplicating release notes, QA checklists, or existing design commentary.
- Preserve the top-level architecture and tooling summary so new AI agents can onboard quickly.
