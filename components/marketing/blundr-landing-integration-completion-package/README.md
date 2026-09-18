# Blundr landing integration completion package

Use this third package beside `blundr-training-demo-package` and `blundr-landing-shell-package`. Keep the completion and training packages as sibling directories during the initial integration so the final composition and adapter imports resolve.

1. Replace the single marked import in `adapters/ProductionBoardBridge.tsx` with the real Blundr production board export.
2. Apply the final glue fix to all five training-demo section roots. Preserve their existing heading IDs and `aria-labelledby` values. `ALL_FIVE_DEMO_SECTION_IDS_PATCHED=YES`.
3. Copy `integration/training-demo-index.ts` to `blundr-training-demo-package/index.ts`; its local exports then resolve from the training package root.
4. Render `integration/FinalLandingPageComposition.tsx`.
5. Copy `assets/tempo-transparent.png` from the shell package to `/public/brand/tempo-transparent.png`.

The final composition has no package-name placeholder import. The only intentionally project-specific line is the clearly marked production board import. No third-party dependency is added.

See `integration/IMPLEMENTATION_ORDER.md` for the exact destination order. Then run typecheck, lint, build, anchor/duplicate-ID checks, desktop/mobile visual QA, keyboard mobile-menu QA, reduced-motion QA, and verify RAF/timers stop offscreen. Confirm all CTA/legal paths remain relative production routes.
