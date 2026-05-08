# Opening Lab v1.0 — AI Opening Coach

This deployable build adds a structured AI coaching layer to the existing Opening Lab trainer.

## What it adds

- Plan-first coaching cards.
- Move-by-move feedback.
- Variation summaries.
- Goals, attacking ideas, pawn breaks, and piece-placement notes.
- `/api/coach` server route.
- Structured JSON output from OpenAI when `OPENAI_API_KEY` is configured.
- Deploy-safe static fallback when no API key is present.
- Local browser cache for generated coach cards.

## Environment variables

For full AI coaching, add this in Vercel:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_COACH_MODEL=gpt-4o-mini
```

`OPENAI_COACH_MODEL` is optional. The app works without a key, but shows fallback content.

## Run

```bash
npm install
npm run dev
```

## Deploy

```bash
git add .
git commit -m "Add AI opening coach"
git push
```


## AI coach setup

Set these environment variables in Vercel:

- `OPENAI_API_KEY` = your OpenAI API key
- `OPENAI_COACH_MODEL` = optional, defaults to `gpt-5.4-mini`

The coach route uses OpenAI Structured Outputs to return schema-valid JSON and falls back to static coaching if no key is configured.
