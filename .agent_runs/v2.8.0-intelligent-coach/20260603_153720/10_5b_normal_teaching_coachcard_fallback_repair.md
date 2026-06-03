# Package 10.5B — Normal Teaching CoachCard Fallback Repair

Status: pass

Summary:
- Identified blocked-mode copy-selection bug routing normal teaching frames to generic `safeFrame.plain` fallback copy.
- Adjusted blocked-mode copy selection to preserve requested mode semantics.
- Updated safe fallback shaping so valid target frames keep target-aligned assisted/show-more copy, while plain-leak/invalid target still use strict fallback.
- Wired CoachCard render to explicit `surfaceCoachCardDecision` object sourced from v2.8 adapted model.
- Extended contract tests for e4/Nf3/Bc4 non-fallback behavior and debug parity checks.

Build:
- PASS

Automated tests (required set):
- PASS

Manual browser QA:
- Not performed in this environment.

Remaining risks:
1. Legacy timeline logger path may still diverge from rendered v2.8 surface in some transitions.
2. Manual live verification still required for final UI confidence.
