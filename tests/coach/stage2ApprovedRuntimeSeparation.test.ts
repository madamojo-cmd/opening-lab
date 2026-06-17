import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { getStage2OpeningAvailability, getStage2OpeningAvailabilitySummary } from "../../lib/blundr/openings/openingAvailability";
import { getStage2RuntimeTrainableRepertoire } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

async function main(): Promise<void> {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 0);

  const opening = getStage2OpeningAvailability("london-white");
  assert.equal(opening?.runtimeAvailable, true);
  assert.equal(opening?.approvedContentAvailable, false);
  assert.equal(getStage2RuntimeTrainableRepertoire("london-white")?.id, "london-white");

  const fallback = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: "london-white",
      playKeyBefore: "d2d4,g8f6,c1f4,e7e6,e2e3,c7c5,c2c3,b8c6,b1d2,d7d5,g1f3",
      targetUci: "f8d6",
      targetSan: "Bd6",
      targetPieceType: "b",
      surface: "assisted",
      runtimeBook: {
        status: "ready",
        candidateCount: 2,
        topCandidateUci: "f8d6",
        topCandidateSan: "Bd6",
        topCandidateRank: 1,
        topCandidateTotalGames: 646303,
        bookExhausted: false,
      },
      plainRevealState: "hidden",
    }),
  );
  assert.equal(fallback.kind, "safe_fallback");
  if (fallback.kind === "safe_fallback") {
    assert.equal(fallback.packet.runtimeReconciliation.status, "matched");
  }
}

main()
  .then(() => {
    console.log("stage2ApprovedRuntimeSeparation ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
