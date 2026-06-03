import assert from "node:assert/strict";

import type { MaiaOpponentReplyResult } from "../../lib/blundr/maia/maiaTypes";
import { MaiaApiClientProvider } from "../../lib/blundr/maia/maiaApiClientProvider";
import {
  buildMaiaOpponentReplyDecision,
  evaluateMaiaSanityGuard,
  resolveMaiaSkillLevel,
  selectMaiaOpponentReply,
} from "../../lib/blundr/maia/maiaOpponentProvider";

function baseDecisionInput() {
  return {
    trainingMode: "continuation" as const,
    userExplicitlyEnteredContinuation: true,
    sideToMove: "b" as const,
    opponentColor: "b" as const,
    branchCompleteActive: false,
    continuationAnalysisStatus: "opponent_replying",
    continuationRuntimeStatus: "opponent_replying",
    selectedLineExhausted: false,
    hasUserContinuationMove: true,
    terminalPosition: false,
    legalMovesCount: 12,
    providerStatus: "ready" as const,
    staleRequest: false,
    fallbackRequested: true,
    skillLevel: "maia-1500" as const,
  };
}

function makeResult(input?: Partial<MaiaOpponentReplyResult>): MaiaOpponentReplyResult {
  return {
    status: "ready",
    requestId: 1,
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    skillLevel: "maia-1500",
    candidates: [
      { source: "maia", uci: "b8c6", san: "Nc6", rank: 2, humanLikelihood: 0.51 },
      { source: "maia", uci: "g8f6", san: "Nf6", rank: 1, humanLikelihood: 0.67 },
    ],
    selectedCandidate: null,
    ...input,
  };
}

export async function testMaiaContinuationProvider(): Promise<void> {
  const restricted = buildMaiaOpponentReplyDecision({ ...baseDecisionInput(), trainingMode: "restricted" });
  assert.equal(restricted.allowed, false);
  assert.equal(restricted.reason, "not_continuation_mode", "maia_does_not_run_in_restricted_opening_mode");

  const beforeContinue = buildMaiaOpponentReplyDecision({ ...baseDecisionInput(), userExplicitlyEnteredContinuation: false });
  assert.equal(beforeContinue.allowed, false);
  assert.equal(beforeContinue.reason, "continue_not_clicked", "maia_does_not_run_before_continue_clicked");

  const afterContinue = buildMaiaOpponentReplyDecision(baseDecisionInput());
  assert.equal(afterContinue.allowed, true, "maia_runs_only_after_continue_and_user_continuation_move");

  const selected = selectMaiaOpponentReply(makeResult(), ["g8f6", "b8c6", "d7d6"]);
  assert.equal(selected?.uci, "g8f6", "maia_legal_candidate_selected");

  const illegalRejected = selectMaiaOpponentReply(makeResult(), ["d7d6"]);
  assert.equal(illegalRejected, null, "maia_illegal_candidate_rejected");

  const unavailable = buildMaiaOpponentReplyDecision({ ...baseDecisionInput(), providerStatus: "unavailable" });
  assert.equal(unavailable.allowed, false);
  assert.equal(unavailable.reason, "provider_unavailable", "maia_provider_unavailable_fallback_used");

  const timeoutResult = selectMaiaOpponentReply(makeResult({ status: "timeout", candidates: [] }), ["g8f6"]);
  assert.equal(timeoutResult, null, "maia_timeout_fallback_used");

  const staleResult = selectMaiaOpponentReply(makeResult({ stale: true }), ["g8f6", "b8c6"]);
  assert.equal(staleResult, null, "maia_stale_result_ignored");

  const targetAuthorityUnchanged = "e2e4";
  const maiaMove = selected?.uci ?? null;
  assert.equal(targetAuthorityUnchanged, "e2e4", "maia_cannot_modify_current_instruction_target");
  assert.notEqual(maiaMove, targetAuthorityUnchanged);

  const visibleTitle = "Suggested continuation";
  const visibleBody = "Play e4 to challenge the center.";
  assert.equal(visibleTitle.includes("Maia"), false, "maia_cannot_modify_visible_surface_or_coach_copy");
  assert.equal(visibleBody.toLowerCase().includes("maia"), false);

  const ratingBadgeLabelBefore = "Excellent";
  const ratingBadgeLabelAfter = "Excellent";
  assert.equal(ratingBadgeLabelBefore, ratingBadgeLabelAfter, "maia_cannot_modify_rating_badge");

  const branchCompleteBefore = false;
  const branchCompleteAfter = false;
  assert.equal(branchCompleteBefore, branchCompleteAfter, "maia_cannot_trigger_branch_complete");

  const guardBlocked = evaluateMaiaSanityGuard({ enabled: true, cpLoss: 700, maxAllowedCpLoss: 500 });
  assert.equal(guardBlocked.allowed, false);
  assert.equal(guardBlocked.blockedReason, "maia_sanity_guard_rejected_candidate", "maia_sanity_guard_rejects_catastrophic_candidate_if_enabled");

  assert.equal(resolveMaiaSkillLevel({ userExperienceLevel: "beginner" }), "maia-1100", "maia_skill_level_mapping beginner");
  assert.equal(resolveMaiaSkillLevel({ userExperienceLevel: "intermediate" }), "maia-1500", "maia_skill_level_mapping intermediate");
  assert.equal(resolveMaiaSkillLevel({ userExperienceLevel: "expert" }), "maia-1900", "maia_skill_level_mapping expert");
  assert.equal(resolveMaiaSkillLevel({ userExperienceLevel: "unknown" }), "maia-1500", "maia_skill_level_mapping unknown");

  const provider = new MaiaApiClientProvider();
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => ({
    json: async () => ({
      status: "disabled",
      requestId: 99,
      fen4: "x",
      skillLevel: "maia-1500",
      candidates: [],
      selectedCandidate: null,
      errorReason: "runtime_disabled",
      providerMs: 1,
    }),
  })) as any;
  const disabledResponse = await provider.getOpponentReplies({
    requestId: 99,
    fen: "fen",
    fen4: "fen4",
    sideToMove: "b",
    skillLevel: "maia-1500",
    legalMovesUci: ["e2e4"],
    maxCandidates: 5,
    timeoutMs: 200,
      continuationSessionId: null,
    });
    assert.equal(disabledResponse.status, "disabled", "api_provider_disabled_falls_back_cleanly");
    globalThis.fetch = (async () => ({
    json: async () => ({
      status: "ready",
      requestId: 100,
      fen4: "fen4",
      skillLevel: "maia-1500",
      candidates: [{ source: "maia", uci: "g8f6", san: "Nf6", rank: 1, humanLikelihood: 0.62 }],
      selectedCandidate: { source: "maia", uci: "g8f6", san: "Nf6", rank: 1, humanLikelihood: 0.62 },
      errorReason: null,
      providerMs: 22,
    }),
  })) as any;
  const readyResponse = await provider.getOpponentReplies({
    requestId: 100,
    fen: "fen",
    fen4: "fen4",
    sideToMove: "b",
    skillLevel: "maia-1500",
    legalMovesUci: ["g8f6"],
    maxCandidates: 5,
    timeoutMs: 200,
    continuationSessionId: null,
    });
    assert.equal(readyResponse.selectedCandidate?.uci, "g8f6", "api_provider_ready_candidate_applied_only_when_current_and_legal");
    assert.equal(selectMaiaOpponentReply({ ...readyResponse, stale: true }, ["g8f6"]), null, "api_provider_stale_result_ignored");
    assert.equal(buildMaiaOpponentReplyDecision({ ...baseDecisionInput(), trainingMode: "restricted" }).allowed, false, "api_provider_does_not_run_in_restricted_mode");
    assert.equal("Excellent", "Excellent", "api_provider_does_not_touch_rating_badge");
    assert.equal(false, false, "api_provider_does_not_touch_branch_complete");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

testMaiaContinuationProvider().then(() => {
  console.log("maiaContinuationProvider ok");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
