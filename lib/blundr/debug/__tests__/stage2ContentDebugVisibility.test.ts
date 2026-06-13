import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildTrainerDebugSnapshot } from "../trainerDebugSnapshot";
import { BlundrDiagnosticsPanel, buildDebugCopyEverythingPayload } from "../../../../components/debug/BlundrDiagnosticsPanel";

export function testStage2ContentDebugVisibility(): void {
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(null));
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(undefined));

  const nullPayload = buildDebugCopyEverythingPayload(null);
  assert.equal(nullPayload.generatedAt, null);
  assert.equal(nullPayload.frame, null);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 901,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 2,
    runtimeBookTopCandidateUci: "e4d5",
    runtimeBookTopCandidateSan: "exd5",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 999,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: false,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://safe-fallback",
    stage2CoachingRuntimeMatched: true,
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });

  assert.equal((snapshot.continuation as any).runtimeBookQueried, true);
  assert.equal((snapshot.continuation as any).runtimeBookOpeningId, "italian-white");
  assert.equal((snapshot.continuation as any).runtimeBookCandidateCount, 2);
  assert.equal((snapshot.continuation as any).runtimeBookTopCandidateUci, "e4d5");

  const copyEverythingPayload = buildDebugCopyEverythingPayload(snapshot);
  const payloadString = JSON.stringify(copyEverythingPayload);
  assert.equal(payloadString.includes("\"runtimeBook\""), true);
  assert.equal(payloadString.includes("\"openingId\":\"italian-white\""), true);
  assert.equal(payloadString.includes("\"topCandidateUci\":\"e4d5\""), true);
  assert.equal(payloadString.includes("\"stage2Coaching\""), true);
  assert.equal(payloadString.includes("\"packetKind\":\"safe_fallback\""), true);

  const html = renderToStaticMarkup(
    React.createElement(BlundrDiagnosticsPanel, {
      snapshot,
      enabled: true,
      onEnabledChange: () => {},
      onClearEvents: () => {},
    }),
  );
  assert.equal(html.includes("Blundr Diagnostics"), true);
}
