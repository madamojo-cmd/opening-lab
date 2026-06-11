# Stage 2 Sample Integration Spike Plan (Plan Only, C.0-SAMPLE v2)

## Next safe spike
- Add a sample-only adapter that accepts already-provided in-memory sample crawl/copy objects.

## Guardrails
- no filesystem auto-load
- no `app/page.tsx` wiring
- no global Stage 2 enablement
- one opening only (`colle-white`)
- feature flag disabled by default

## Lookup strategy for sample content
- Resolve content using `openingId + nodeKey/playKey + moveUci + conceptId`.
- `lineId` in sample copy carries `playKey` reconciliation evidence.
- sample adapter may filter/select copy, but it must not choose runtime move targets.

## Runtime authority invariants
- `CurrentInstructionFrame.target` remains target authority.
- `buildVisibleTeachingSurface` remains visible surface authority.
- Plain View no-leak policy remains preserved.
- Assisted View and Show More parity remain preserved.

## Visual metadata policy
- `visualRecipeRefs` remain metadata only in this spike.
- No visual recipe rendering or runtime visual mapping in this lane.

## Safety and reversibility
- Sample copy may render only when target-aligned and safe.
- Sample integration path must be deletable without affecting production data.

## Explicit non-goals
- This does not replace final Phase C.
- This does not replace final 21-opening validation.
- This does not start production Phase D.
