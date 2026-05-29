# v2.7.35b Patch Notes

## Added
- Production Training Context Engine for board-aware, context-safe teaching.
- Separation between move recommendation trust and teaching context trust.
- Chess Feature Graph for concrete pieces, squares, files, king zones, loose pieces, and phase signals.
- Move Semantic Analyzer that explains what a move changes before and after it is played.
- Top Move Comparison layer for safe educational contrast when a saved move is not trusted.
- Grounded story ranking with specificity, concrete grounding, reveal-risk, and genericness penalties.
- Variable coach templates that name the relevant piece, square, target, file, or context.
- Concept-aligned visual routing with answer overlays separated from context overlays.
- Richer learning metadata for story selection, trust, visual decisions, and recommendation suppression.

## Changed
- Rejected saved moves now prefer Assisted Context when safe board evidence exists.
- “Line needs review” is reserved for positions without useful safe context.
- Assisted View may show context visuals without endorsing an untrusted move.
- “Next: Play” is suppressed unless recommendation permissions explicitly allow it.
- Move Impact now reflects the Training Context Engine mode.
- Generic development language was demoted in favor of concrete, grounded teaching claims.

## Preserved
- Move Quality Gate remains intact.
- Plain View still shows no pre-move hints, overlays, arrows, rings, context visuals, or plan indicators.
- No automatic `/api/brain` calls were reintroduced.
- Manual Reveal remains available.
- Existing debug panels remain available, with richer Training Context Engine details.

## Not Included
- Maia integration.
- New bot behavior.
- Full bot refactor.
- External analytics.
- Account or database persistence.

