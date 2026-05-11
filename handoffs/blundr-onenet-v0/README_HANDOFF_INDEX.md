# BlundrOneNet v0 Handoff Package

This folder contains specific implementation handoffs for the BlundrOneNet v0 roadmap, based on the current Blundr repo information:

- Repo: `https://github.com/madamojo-cmd/opening-lab`
- Branch: `blundr-v2.7.1-product-review-core`
- Previous stable branch: `blundr-v2.7-stability-temporal-core`
- Current app: Next.js/Vercel, custom board in `app/page.tsx`, `chess.js`, browser Stockfish, `/api/brain`, `/api/explorer`

## Read order

1. `01_contracts_and_enums_handoff.md`
2. `02_training_state_machine_handoff.md`
3. `03_feature_packet_builder_handoff.md`
4. `04_verifier_handoff.md`
5. `05_rule_visual_selector_handoff.md`
6. `06_synthetic_label_generation_handoff.md`
7. `07_model_training_handoff.md`
8. `08_fastapi_model_server_handoff.md`
9. `09_nextjs_api_bridge_handoff.md`
10. `10_frontend_rendering_handoff.md`
11. `11_debug_panel_handoff.md`
12. `12_qa_acceptance_tests_handoff.md`

## Critical build principle

Build the verified rule/Stockfish pipeline first, start label generation/training early, and integrate the neural model only behind masking, verification, and deterministic fallback.

## Non-negotiable product rule

All v2.7.1 A-J fixes are regression-protected. BlundrOneNet integration must preserve them.
