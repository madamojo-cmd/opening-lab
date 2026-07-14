import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildDebugCopyEverythingPayload, BlundrDiagnosticsPanel } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildStage2CoachContext, resolveStage2CoachingPacket, STAGE2_APPROVED_CONTENT_ENABLED } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const STAGE2_COACHING_DIR = path.join(REPO_ROOT, "lib", "blundr", "stage2Coaching");

function importSpecifiers(content: string): string[] {
  const out: string[] = [];
  const re = /\bfrom\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null = re.exec(content);
  while (match) {
    out.push(match[1]);
    match = re.exec(content);
  }
  return out;
}

export function testStage2CoachingResolverShell(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "london-white" && entry.moveUci === "g1f3" && entry.status === "approved");
  const baseContext = buildStage2CoachContext({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: "n",
    surface: "plain_hint",
    runtimeBook: {
      status: "ready",
      candidateCount: 4,
      topCandidateUci: packet.moveUci,
      topCandidateSan: packet.moveSan,
      topCandidateRank: 1,
      topCandidateTotalGames: 12034,
      bookExhausted: false,
    },
    plainRevealState: "hidden",
  });

  const result = resolveStage2CoachingPacket(baseContext);
  assert.equal(STAGE2_APPROVED_CONTENT_ENABLED, true, "approved_content_must_be_enabled_for_live_activation");
  assert.equal(result.kind, "approved_packet", "exact_approved_packet_must_win_before_fallback");

  if (result.kind !== "approved_packet") return;
  assert.equal(result.packet.moveUci, "g1f3", "resolver_must_not_change_target_uci");
  assert.equal(result.packet.moveSan, packet.moveSan, "resolver_output_should_align_to_target");
  assert.equal(result.packet.status, "approved", "approved_packet_must_remain_safe_for_display");
  assert.notEqual(result.packet.sourceFile, "stage2://safe-fallback", "client_resolver_must_use_exact_approved_package");
  assert.equal(result.packet.runtimeReconciliation.status, "matched", "fallback_packet_must_match_runtime_context");
  assert.equal(result.packet.body.includes(packet.moveSan), false, "plain_hidden_body_must_not_leak_target_san");
  assert.equal(result.packet.body.includes("g1f3"), false, "plain_hidden_body_must_not_leak_target_uci");
  assert.equal((result.packet.hint ?? "").includes(packet.moveSan), false, "plain_hidden_hint_must_not_leak_target_san");
  assert.equal((result.packet.hint ?? "").includes("g1f3"), false, "plain_hidden_hint_must_not_leak_target_uci");

  const showMore = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      ...baseContext,
      surface: "plain_show_more",
      plainRevealState: "show_more",
      runtimeBook: {
        ...baseContext.runtimeBook,
        topCandidateRank: 2,
        topCandidateTotalGames: 9988,
      },
    }),
  );
  assert.equal(showMore.kind, "approved_packet", "show_more_should_use_exact_approved_packet");
  if (showMore.kind === "approved_packet") {
    assert.equal((showMore.packet.showMore ?? "").length > 0, true, "show_more_must_include_approved_copy");
  }

  const fallback = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      ...baseContext,
      targetUci: "a1a2",
      targetSan: "Ra2",
      learnerSide: "white",
      sideToMove: "white",
      surface: "assisted",
    }),
  );
  assert.equal(fallback.kind, "safe_fallback", "resolver_should_fallback_when_no_approved_packet_matches");
  if (fallback.kind === "safe_fallback") {
    assert.equal(fallback.packet.moveUci, "a1a2", "fallback_must_preserve_target_uci");
  }

  const stage2Files = fs.readdirSync(STAGE2_COACHING_DIR).filter((name) => /\.(ts|tsx)$/.test(name));
  for (const file of stage2Files) {
    const full = path.join(STAGE2_COACHING_DIR, file);
    const content = fs.readFileSync(full, "utf8");
    const specs = importSpecifiers(content).map((spec) => spec.toLowerCase());
    assert.equal(specs.some((spec) => spec.includes("docs/content/stage2")), false, `forbidden_content_import:${file}`);
    assert.equal(specs.some((spec) => spec.includes("imports/stage2-sample")), false, `forbidden_sample_import:${file}`);
    assert.equal(specs.some((spec) => spec.endsWith(".md")), false, `forbidden_markdown_import:${file}`);
    assert.equal(/docs\/content\/stage2|imports\/stage2-sample/i.test(content), false, `forbidden_content_reference:${file}`);
  }

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 707,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://safe-fallback",
    stage2CoachingRuntimeMatched: true,
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });

  assert.equal((snapshot.continuation as any).stage2CoachingPacketKind, "safe_fallback");
  assert.equal((snapshot.continuation as any).stage2CoachingRuntimeMatched, true);

  const copied = JSON.stringify(buildDebugCopyEverythingPayload(snapshot));
  assert.equal(copied.includes("\"stage2Coaching\""), true, "copy_everything_must_include_stage2_coaching");
  assert.equal(copied.includes("\"packetKind\":\"safe_fallback\""), true, "copy_everything_must_include_packet_kind");

  const html = renderToStaticMarkup(
    React.createElement(BlundrDiagnosticsPanel, {
      snapshot,
      enabled: true,
      onEnabledChange: () => {},
      onClearEvents: () => {},
    }),
  );
  assert.equal(html.includes("Blundr Diagnostics"), true, "diagnostics_panel_should_render_with_stage2_fields");
}

testStage2CoachingResolverShell();
console.log("stage2CoachingResolverShell ok");
