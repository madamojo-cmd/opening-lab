# BLUNDR v2.8.0 Provider Failure Policy

## Core Rule
Provider failure must degrade safely and must not crash application flow.

## Authority Rule
Provider outputs cannot override `CurrentInstructionFrame.target` as visible teaching authority.

## Baseline Safety Behavior
- If Stockfish evidence is unavailable, engine-backed claims are suppressed.
- If continuation/context providers fail, coaching remains deterministic and target-locked.
- If opening knowledge retrieval fails, no direct rendering from missing provider output.
- Safety gate is expected to block unsupported high-confidence claims.

## Package 0 Status
Policy documented only. No product-code behavior changes were made in Package 0.
