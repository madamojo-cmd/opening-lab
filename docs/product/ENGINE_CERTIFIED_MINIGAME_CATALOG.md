# Engine-certified deep minigame catalog

## Release inventory

- Supplied records: 920
- Active unique family/position records: 857
- Quarantined repeated family/position variants: 63
- Tactic Shots: 320 active
- Knight Gymnasium: 360 active
- King & Pawn Lab: 177 active

The active catalog is
`lib/blundr/daily/miniGames/deep/catalog/engineCertifiedCatalog.v1.json`.
The linked quarantine manifest is stored beside it.

## Authority and safety

The catalog is server-owned. Public instance responses expose only the current
board, objective, progress, feedback allowed for the current state, and
optimistic-concurrency revision. They do not expose the solution line,
accepted moves, Stockfish evaluation, theme evidence, or checksum before an
explicit reveal.

Every active record must pass:

- FEN loading and non-terminal start checks;
- recorded legal-move count;
- 11–32-piece limits, with King & Pawn Lab limited to kings/pawns and no more
  than 18 pieces;
- complete PV replay with legal UCI moves and matching SAN/piece/color;
- family-specific learner-depth rules;
- Stockfish 18 Lite depth-8 evidence and SHA-256 content checksum;
- unique FEN within its minigame family.

Run `npm run verify:deep-minigame-catalog` after any catalog change.

## Duplicate policy

The supplied King & Pawn Lab set repeated 52 starting positions, accounting for
63 extra variants. Some repeated boards used different principal variations.
Showing one identical board while grading several different single-answer
routes would be misleading. For each repeated FEN within a family, the final
supplied record is retained and earlier variants are quarantined with an
explicit `retainedId` link.

Identical FENs in different families are allowed only when the product
objective is genuinely different and the family contract/tests remain
truthful.

## Reproducibility limitation

The prepared package supplied the resulting 920-record catalog and evidence,
but it did not include the original generator or complete engine run log.
Therefore:

- current records and lines are independently replayed and checksummed;
- the application does not claim the corpus can be regenerated bit-for-bit;
- `sourceGeneratorAvailable` remains `false`;
- replacing or expanding the catalog requires a versioned generator, locked
  engine/runtime, source manifest, deterministic seed contract, and new
  validation evidence.

This limitation must remain visible in the system registry until resolved.
