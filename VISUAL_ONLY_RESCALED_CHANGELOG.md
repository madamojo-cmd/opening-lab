# Visual-only rescale patch

This build keeps the v2.7 Board Lab Temporal Gate visual package but fixes the sizing mismatch.

## Changed

- Increased target/source/midpoint gate rings from tiny point markers to board-lab-scale rings.
- Target destination rings now occupy roughly 70% of a square rather than around 15% of a square.
- Increased path rails, animated timing rail thickness, motif tokens, label size, corner dots, and arrowheads.
- Added destination aura and inner target ring for better visual hierarchy.

## Not changed

- Training flow
- Repertoire logic
- Stockfish/Lichess/GPT pipeline
- Move legality
- Package dependencies
- App routing
