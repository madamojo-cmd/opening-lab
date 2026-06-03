# Package 10.5C — False Safety Block Repair

Status: pass

Summary:
- Fixed false `piece_mismatch` by normalizing piece codes (`p/n/b/r/q/k`) to canonical names.
- Fixed false `plain_leak` triggers caused by one-letter piece tokens.
- Split SafetyGate into fatal block vs recoverable downgrade.
- Recoverable claim-validation failures now render safe target-aligned teaching copy (non-blocked surface).
- Added richer surface safety debug fields including blocked reason/severity/policy and recovery flag.

Key regression covered:
- valid_knight_development_claim_validation_failed_recovers_to_teaching_copy

Validation:
- Build and full requested command set executed.
- One initial anti-hallucination assertion was updated to match recoverable policy; rerun passes.

Manual QA:
- Not performed in this environment.
