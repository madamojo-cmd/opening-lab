# Package 3 Risk Register - Ground-Truth Test Harness

## Risks Consumed from Package 2
- Canonical chain is not yet wired end-to-end in product runtime.
- Legacy bypass paths remain unresolved from Package 1/2 by design.
- Parallel type definitions still exist in legacy modules.

## Package 3 Residual Risks
- Tests are contract-first harnesses; many assert fixture and shape behavior rather than integrated runtime orchestration.
- Browser assertions are encoded as a validated contract object because no browser runner is configured in `package.json`.
- `git grep` anti-false-test audit pattern reports many unrelated `return true` matches in production code; this is noisy but documented.
- Ground-truth set currently includes 25 curated fixtures; expansion to larger release-hardening corpus remains future work.

## Package 3 Blocking Risks
- None.

## Net Gate
- Package 3 can pass as harness baseline with known integration follow-up in Package 4+.
