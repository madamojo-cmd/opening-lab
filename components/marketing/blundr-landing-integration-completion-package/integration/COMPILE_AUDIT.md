# Compile-oriented audit

- Imports: after copying `training-demo-index.ts` to the training package root, package-relative imports resolve with the training and completion directories as siblings; one marked production-board import requires project-path substitution.
- Exports: all five demos and three public board prop types are re-exported.
- Props: FEN, orientation, arrows, highlights, colors, emphasized square, last move, interactivity, and animation duration are forwarded.
- CSS: every module class referenced exists; tokens are scoped under `BlundrMarketingRoot`; no generic global selectors ship here.
- Anchors: `why-blundr`, `training-demo`, `daily-blundr`, `smart-review`, `repertoire-mastery`, `consistency`, `momentum`, `pricing`, `final-cta`.
- IDs: all five training-demo root sections require the final glue patch. `ALL_FIVE_DEMO_SECTION_IDS_PATCHED=YES`.
- Client boundaries: interaction/observer components declare `use client`; static pricing/footer/root remain server-safe.
- Cleanup: Hero listeners are React-scoped; Momentum disconnects IntersectionObserver and cancels RAF; existing demos retain timer/observer cleanup.
- Assets: the reconciled manifest matches Header, Hero, Momentum, Mastery, and Footer consumers.
