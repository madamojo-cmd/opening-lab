import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const APP_PAGE = path.join(REPO_ROOT, "app", "page.tsx");

export function testRuntimeBookBeforeContinuation(): void {
  const promoted = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen:
      "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10",
    boardFen4:
      "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stage2-runtime-book",
    continuationResolvedTargetLabel: "Book",
    continuationResolvedTargetFen4:
      "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });

  assert.equal(promoted.candidate?.uci, "h2h3");
  assert.equal(promoted.candidate?.source, "stage2-runtime-book");
  assert.equal(promoted.candidate?.reason, "stage2_runtime_book_promoted");
  assert.equal(promoted.guard.stockfishPromotionGuardSourceAllowed, true);

  const appPage = fs.readFileSync(APP_PAGE, "utf8");
  assert.match(
    appPage,
    /runtimeBookPreferredCandidate\?\.uci\s*\?\?\s*stockfishTopMovesForContinuation\.bestMoveUci\s*\?\?\s*null/,
    "app_page_must_resolve_runtime_book_before_stockfish",
  );
  assert.equal(
    /\?\s*"stage2-runtime-book"/.test(appPage),
    true,
    "app_page_must_mark_runtime_book_candidate_source",
  );
  assert.equal(
    /\?\s*"runtime_book_ready"/.test(appPage),
    true,
    "app_page_must_expose_runtime_book_ready_status",
  );
}

testRuntimeBookBeforeContinuation();
console.log("runtimeBookBeforeContinuation ok");
