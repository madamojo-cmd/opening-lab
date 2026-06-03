# Package 5 Risk Register - Deterministic EvidenceGraph

## Risks Consumed From Package 4
- CurrentInstructionFrame dual-input compatibility path remains active.
- Legacy bypass UI paths remain unresolved by design.
- Continuation legality remains structural at runtime-authority layer.

## Package 5 Residual Risks
- Tactical/strategic detection is intentionally conservative and heuristic; advanced motifs remain partial.
- `EvidenceGraph` currently uses machine-readable summaries and flags only; no language compiler integration yet.
- Provider statuses are deterministic placeholders for external providers (`stockfish`, `maia`, `opening_knowledge` set to `not_applicable`) until provider integration packages.
- Existing legacy `brain/boardTruth/buildBoardTruth.ts` was made type-compatible but still remains a transitional path separate from new provider-based graph flow.

## Package 5 Blocking Risks
- None.

## Net Gate
- Package 5 can pass with deterministic evidence graph foundations complete and advanced detection/provider integration deferred.
