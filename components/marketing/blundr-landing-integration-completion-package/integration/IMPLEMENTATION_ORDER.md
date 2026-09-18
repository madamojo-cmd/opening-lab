# Exact implementation order

1. Place `blundr-training-demo-package`, `blundr-landing-shell-package`, and this completion package beside one another.
2. Copy `integration/training-demo-index.ts` from this package to `blundr-training-demo-package/index.ts`.
3. Add `id="training-demo"` to the existing outer section in `MarketingTrainingDemo.tsx` using `demo-anchor-patches.diff`. Do not patch the four IDs already present.
4. Copy the completion package source into the landing-page implementation area while preserving its internal folder structure.
5. Replace only the marked production board import in `adapters/ProductionBoardBridge.tsx`.
6. Copy `blundr-landing-shell-package/assets/tempo-transparent.png` to `public/brand/tempo-transparent.png`.
7. Render `integration/FinalLandingPageComposition.tsx` from the landing route.
8. Run the app's typecheck, lint, build, and desktop/mobile browser checks.

The shell package remains the design reference and asset source; its superseded hero, pricing, Momentum, button, header, footer, and page-composition files are not rendered alongside the corrected files in this package.
