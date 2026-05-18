# v2.7.35 QA Acceptance Report

## Build and Guardrails
[x] npm run build passes.
[x] No automatic /api/brain on position update.
[x] No automatic /api/brain on wrong move.
[x] Manual Reveal path still present.

## Teaching Intelligence Scenarios
[ ] 1. Verified tactical move.
[ ] 2. Verified quiet development move.
[ ] 3. Book-supported opening move rejected by strict engine.
[ ] 4. Saved-line move needing review.
[ ] 5. Context-only loose piece.
[ ] 6. Context-only king safety.
[ ] 7. Context-only center tension.
[ ] 8. Quiet strategic improve-worst-piece position.
[ ] 9. Open file position.
[ ] 10. Weak square/outpost position.
[ ] 11. Simple endgame king activity position.
[ ] 12. Non-capturing loose-piece pressure says Attack the loose piece.
[ ] 13. Actual loose-piece capture may say Win the loose piece.
[ ] 14. Strong alternative is respected, not punished.
[ ] 15. Bad alternative is not falsely endorsed.

## View and Visual Rules
[ ] 16. Plain View shows zero pre-move visuals.
[ ] 17. Assisted View shows context visuals when answer visuals are blocked.
[ ] 18. Context-only cue never says Play X.
[ ] 19. Debug shows selected and rejected story scores.
[ ] 20. Learning metadata includes story and visual data.
[ ] 21. No automatic brain calls introduced.
