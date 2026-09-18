# Blundr landing shell package

THIS PACKAGE CONTAINS ONLY THE LANDING-PAGE PIECES NOT INCLUDED IN `blundr-training-demo-package`.

It is a separate transfer package for the finalized Blundr landing page. The five existing interactive demos are referenced by composition only and are intentionally not copied.

## Included

Header/navigation, complete hero with Tempo/board interaction, Momentum reward section, Free + Pro pricing, final Start Now CTA, footer, scoped marketing tokens, page composition, route/copy config, asset manifest, board adapter contract, and responsive/animation contract.

## Combine with the existing package

Copy this package into the marketing feature directory alongside `blundr-training-demo-package`. Resolve the five imports in `page/BlundrLandingPageComposition.tsx` to the existing demo components. Supply the production board adapter and Tempo asset path, then render the composition. The exact order is documented in `MANIFEST.md` and `integration/IMPLEMENTATION_ORDER.md`.

Production destinations are relative by design: free signup `/signup?next=/onboarding/welcome`, login `/login`, Pro `/billing/upgrade`, plan comparison `/pricing`, and legal routes `/privacy`, `/terms`, `/subscription-terms`, `/cookies`, `/legal`.

No new dependency or application logic is required. Keep all marketing animations deterministic and disconnected from Supabase, authentication, Maia, Stripe, RevenueCat, billing, entitlements, and product training state.

The hero intentionally contains none of the removed walkthrough items: “Train with Tempo,” “See how Blundr trains,” or “Move across the board to guide Tempo.”
