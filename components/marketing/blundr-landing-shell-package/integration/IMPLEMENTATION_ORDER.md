# Implementation order

1. Copy `shared/landing-tokens.css` and `shared/MarketingButton.tsx` into the marketing feature directory.
2. Copy header, hero, Momentum, pricing, final CTA, and footer folders.
3. Resolve the five imports in `page/BlundrLandingPageComposition.tsx` to the existing `blundr-training-demo-package`; do not copy those modules.
4. Supply the production board adapter and `/brand/tempo-transparent.png`.
5. Render the composition and verify IDs: `why-blundr`, `training-demo`, `daily-blundr`, `smart-review`, `repertoire-mastery`, `consistency`, `momentum`, `pricing`, `final-cta`.
6. Run desktop/mobile/reduced-motion QA and confirm all CTA/legal destinations remain relative production routes.
