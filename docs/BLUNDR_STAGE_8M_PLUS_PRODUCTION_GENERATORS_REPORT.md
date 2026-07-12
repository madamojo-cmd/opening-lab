# Blundr Stage 8M+ Production Generator Report

- Seed: `stage-8m-plus`
- Requested maximum per game: 30
- Narrowed run: none
- Unique opening source frames loaded: 105
- Accepted: 180
- Rejected candidates: 1299
- Runtime-invalid accepted rows: 0
- Duplicate novelty keys: 0

## Accepted by minigame
- imbalance_arena: 30
- key_square_conquest: 30
- king_race: 30
- pawn_wars: 30
- structure_builder: 30
- technique_lab: 30

## Accepted by concept
- imbalance_arena/good_knight_vs_bad_bishop: 30
- key_square_conquest/blockade: 2
- key_square_conquest/invasion: 28
- king_race/critical_square: 1
- king_race/king_route: 3
- king_race/promotion_race: 26
- pawn_wars/breakthrough: 5
- pawn_wars/outside_passer: 18
- pawn_wars/passed_pawn_creation: 7
- structure_builder/locked_center_break: 6
- structure_builder/passed_pawn_creation: 2
- structure_builder/pawn_break: 22
- technique_lab/active_king: 2
- technique_lab/king_cutoff: 2
- technique_lab/opposition: 26

## Difficulty distribution
- imbalance_arena/easy: 6
- imbalance_arena/expert: 6
- imbalance_arena/hard: 6
- imbalance_arena/intro: 6
- imbalance_arena/medium: 6
- key_square_conquest/easy: 6
- key_square_conquest/expert: 6
- key_square_conquest/hard: 6
- key_square_conquest/intro: 6
- key_square_conquest/medium: 6
- king_race/easy: 6
- king_race/expert: 6
- king_race/hard: 6
- king_race/intro: 6
- king_race/medium: 6
- pawn_wars/easy: 6
- pawn_wars/expert: 6
- pawn_wars/hard: 6
- pawn_wars/intro: 6
- pawn_wars/medium: 6
- structure_builder/easy: 6
- structure_builder/expert: 6
- structure_builder/hard: 6
- structure_builder/intro: 6
- structure_builder/medium: 6
- technique_lab/easy: 6
- technique_lab/expert: 6
- technique_lab/hard: 6
- technique_lab/intro: 6
- technique_lab/medium: 6

## Rejection reasons
- imbalance_arena/insufficient_durable_activity_delta: 32
- key_square_conquest/square_proof_failed: 146
- king_race/no_unique_bounded_best_move: 31
- pawn_wars/no_passer_or_breakthrough_delta: 8
- structure_builder/no_meaningful_structure_delta: 544
- technique_lab/no_named_technique_geometry: 538

## Verification status
- Bounded-search reviewed: 90
- Engine reviewed: 0
- Tablebase reviewed: 0
- Human audit required: 0

## Promotion rule
Only scenarios with legal FENs, legal primary moves, concrete proof objects, square-specific explanations, and plausible refuted alternatives are written as runtime-ready.
