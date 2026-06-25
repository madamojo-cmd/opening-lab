Runtime cleanup audit

Findings:
- `app/page.tsx` statically imports `lib/blundr/openings/runtimeTrainableRepertoires.ts`.
- That module statically imports `lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated.ts`, which is about 12.9 MB on disk.
- The page also statically imports `resolveAdaptiveOpeningIdentity`, which pulls in the Lichess identity manifest, but the runtime repertoire payload is the clear primary bundle offender.
- The page is a single large client component, so any static import here is paid by the first route chunk and by dev compilation.

Plan:
- Keep the curated opening shell and runtime catalog visible immediately.
- Replace the static runtime repertoire import with a lightweight opening selector.
- Load the heavy runtime line data only when a runtime opening is actually selected.
- Add a regression test that rejects static imports of the heavy runtime repertoire module from `app/page.tsx`.
