# Blundr marketing package

Standalone Next.js marketing target for `blundr.io`. It owns public education, pricing presentation, support, and legal pages; account creation and purchases remain on the app domain.

## Local use

```sh
npm install
PUBLIC_APP_BASE_URL=http://localhost:3001 npm run dev
npm test
npm run build
```

`PUBLIC_APP_BASE_URL` must be a validated app origin. Production uses `https://app.blundr.io`; Preview/staging must use the authorized staging app origin. CTAs only accept relative paths and bounded attribution sources.

Contact intentionally uses a truthful `mailto:` fallback until an approved support transport exists. Media is represented by labeled placeholders; no screenshots or claims are fabricated here.

## Boundaries

This package does not contain auth, Supabase, provider workers, billing mutation, chess solutions, product APIs, or minigame engines. The standalone minigame count is exactly three: Deep Tactic Shots, Knight Gymnasium, and King & Pawn Lab. No deployment or DNS change is part of this package.
