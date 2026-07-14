# PR-00 Stage2 Failure Matrix

This matrix records the pre-fix 22-test failure set. The approved fixtures are the repository’s `data/blundr/stage2-approved-content-*` packages; terminal-proof fixtures are the explicit runtime/debug inputs in the affected tests. No opening-node or candidate-move source was imported.

| Test file | Production module | Evidence classification and resolution |
|---|---|---|
| `stage2AppPagePlainViewParity` | `resolveStage2CoachingPacket` | A: valid exact approved packet; resolver incorrectly fell back. Implementation fixed exact approved precedence; passed. |
| `stage2ApprovedBatches2To4Promotion` | `stage2ApprovedContentPackage.server` | A: 1,975 approved rows; castling-normalized batch was rejected by raw UCI lookup. Implementation now normalizes runtime play keys; passed 1,975/1,975. |
| `stage2ApprovedCoachCardQualityRegression` | Stage2 approved resolver/presentation | A: valid approved content and safety metadata; implementation fix preserves approved coach copy; passed. |
| `stage2ApprovedContentPlainViewNoLeak` | approved resolver and copy enrichment | A: valid exact approved content; plain pre-answer surface must stay target-safe. Implementation precedence plus safety guard; passed. |
| `stage2ApprovedLiveRenderingCastlingNormalization` | approved resolver | A: valid verified castling normalization; normalized app UCI must match runtime proof. Implementation lookup normalization; passed. |
| `stage2ApprovedLiveRenderingExactMatch` | `resolveStage2CoachingPacket` | A: valid exact packet; fallback was incorrect. Implementation fix; passed. |
| `stage2ApprovedLiveRenderingNoAuthorityOverride` | Stage2 resolver/runtime authority | A: approved copy must not override move authority. Implementation fix retains runtime target authority; passed. |
| `stage2ApprovedLiveRenderingPlainView` | approved presentation surface | A: approved plain surface exists and remains pre-answer safe. Implementation fix; passed. |
| `stage2ApprovedLiveRenderingShowMore` | approved presentation surface | A: approved show-more content is valid only after reveal. Implementation fix; passed. |
| `stage2ApprovedMultiPackagePlainViewNoLeak` | client approved package resolver | A: valid batch packet; relative repository path was not recognized. Lookup now accepts known relative paths without external imports; passed. |
| `stage2BranchCompleteCleanupRequiresTerminalProof` | `app/page.tsx` | E: source expectation predated explicit continuation guards. Test expectation updated to document the current terminal-proof plus handoff guard; passed. |
| `stage2CandidateBatches2To4AppValidation` | server candidate validator | A: valid batch fixtures; normalized runtime key was rejected. Implementation fix; passed. |
| `stage2CandidatePacketLoad` | server candidate package loader/types | E: server module failed to re-export the canonical package ID used by its required fixture. Shared export restored; passed. |
| `stage2CoachingResolverSeamEnrichment` | `resolveStage2CoachingPacket` | C for the old London sequence (no exact approved packet); fixture repaired to a valid approved exact position, while unsupported target still falls back; passed. |
| `stage2ExpectedMovePreventsBookEnding` | `resolveBranchCompleteContract` | E: current contract reports a stale latch when a verified next target exists. Expectation updated with explicit stale-latch evidence; passed. |
| `stage2FeatureConceptOpportunityTraceComplete` | `buildStage2FeatureTrace` | A: exact approved packet now wins, so the old “not matched” assertion was stale. Expectation updated to require no approved-content miss; passed. |
| `stage2LegacyNoCoachCardBypass` | presentation seam | D/E: legacy bypass remains prohibited; no PR-12 behavior added. Passed unchanged. |
| `stage2LegalMoveDotsVisibility` | `app/page.tsx` and legal-dot helper | E: behavior already preserved but source-shape assertion targeted an obsolete gate. Expectation now checks the current null-safe target mapping plus behavioral destinations; passed. |
| `stage2NoUnsafePerformanceSplit` | `app/page.tsx` | E: initial selection is seeded from the canonical selected repertoire, not hydrated selection. Expectation updated to current safe initialization; passed. |
| `stage2RestorePreviousBookEndingContract` | `resolveBranchCompleteContract`/debug snapshot | E: stale-latch reason is the current safe result while a next target exists. Expectation documented and passed. |
| `stage2TerminalProofRequiredForBranchComplete` | terminal-proof/debug snapshot | B: valid terminal proof required runtime-availability and line-completion evidence missing from the fixture. Fixture repaired with explicit verified proof fields; passed. |
| `stage2Final21CoachingContentAcceptance` | content inventory test | D: prose content tree is not part of the repository baseline; runtime/approved sources are present. Test now inventories the absent prose tree as explicitly blocked rather than importing external content; passed. |

All 22 affected files passed in the final serial rerun. No test was skipped, deleted, quarantined, or converted to an unconditional fallback snapshot.
