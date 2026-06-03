# Package 5 Command Log - Deterministic EvidenceGraph

## Prerequisite Reads
- Read Agent 1 authority audit report.
- Read Agent 1 legacy bypass map.
- Read Agent 2 core contracts report.
- Read Agent 3 ground-truth test harness report.
- Read Agent 4 CurrentInstructionFrame report.
- Read latest state/risk:
  - `.agent_runs/v2.8.0-intelligent-coach/20260603_133053/state.json`
  - `.agent_runs/v2.8.0-intelligent-coach/20260603_133053/risk_register.md`

## Step A - Inspect existing evidence/brain structure
- `git branch --show-current`
  - output: `v2.8.0-intelligent-coach-live`
- `git status --short`
  - output (excerpt):
    - `?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md`
    - `?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md`
- `find lib/blundr/brain -maxdepth 4 -type f | sort || true`
- `find lib/blundr/runtime -maxdepth 3 -type f | sort`
- `find tests/coach -maxdepth 2 -type f | sort`
- `git grep -n "EvidenceGraph\|CoachEvidenceClaim\|buildEvidenceGraph\|boardTruthProvider\|moveSemanticsProvider\|tacticalMotifProvider\|strategicFeatureProvider\|openingContextProvider\|visualEvidenceProvider" lib app components tests || true`
- `git grep -n "Chess\|chess.js\|fen\|legalMoves\|moves({\|new Chess" lib app components tests package.json || true`

## Step B - Chess rules source confirmation
- Confirmed repository uses `chess.js` (`package.json` dependency and multiple existing imports).
- Deterministic board-truth legality logic implemented with existing `chess.js`.
- No new dependencies added.

## Validation Commands
- `npm run build`
  - first run failed due stricter `BoardTruth` typing mismatch in legacy `lib/blundr/brain/boardTruth/buildBoardTruth.ts`.
  - fixed compatibility typing.
- `npm run build`
  - pass.

- `node --import tsx tests/coach/evidenceGraph.test.ts`
  - first run failed due a capture test fixture FEN mismatch.
  - updated fixture FEN in test.
- `node --import tsx tests/coach/evidenceGraph.test.ts`
  - pass (`evidenceGraph ok`).

- `node --import tsx tests/coach/currentInstructionFrame.test.ts` → pass
- `node --import tsx tests/coach/typeContracts.test.ts` → pass
- `node --import tsx tests/coach/goldenPositions.test.ts` → pass
- `node --import tsx tests/coach/targetInvariant.test.ts` → pass
- `node --import tsx tests/coach/continuationFlow.test.ts` → pass
- `node --import tsx tests/coach/plainLeak.test.ts` → pass
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts` → pass
- `node --import tsx tests/coach/providerFailure.test.ts` → pass
- `node --import tsx tests/coach/antiHallucination.test.ts` → pass
- `node --import tsx tests/coach/browserContract.test.ts` → pass

## Script Availability Notes
- `npm test` script not present.
- `npm run lint` script not present.

## Final Verification
- `git status --short`
- `git diff --stat`
