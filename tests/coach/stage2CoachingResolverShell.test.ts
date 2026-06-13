import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildDebugCopyEverythingPayload, BlundrDiagnosticsPanel } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildStage2CoachContext, resolveStage2CoachingPacket, STAGE2_APPROVED_CONTENT_ENABLED } from "../../lib/blundr/stage2Coaching";

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
  const baseContext = buildStage2CoachContext({
    openingId: "london-white",
    playKeyBefore: "d2d4,d7d5,c1f4",
    targetUci: "g1f3",
    targetSan: "Nf3",
    targetPieceType: "n",
    surface: "plain_hint",
    runtimeBook: {
      status: "ready",
      candidateCount: 4,
      topCandidateUci: "g1f3",
      topCandidateSan: "Nf3",
      topCandidateRank: 1,
      topCandidateTotalGames: 12034,
      bookExhausted: false,
    },
    plainRevealState: "hidden",
  });

  const result = resolveStage2CoachingPacket(baseContext);
  assert.equal(STAGE2_APPROVED_CONTENT_ENABLED, false, "approved_content_must_be_disabled_for_shell");
  assert.equal(result.kind === "approved_packet", false, "resolver_must_not_emit_approved_packet");
  assert.equal(result.kind, "safe_fallback", "resolver_should_emit_safe_fallback_without_content_source");

  if (result.kind !== "safe_fallback") return;
  assert.equal(result.packet.moveUci, "g1f3", "resolver_must_not_change_target_uci");
  assert.equal(result.packet.moveSan, "Nf3", "resolver_output_should_align_to_target");
  assert.equal(result.packet.body.includes("best"), false, "fallback_must_not_use_unsupported_best_claim");
  assert.equal(result.packet.body.includes("forced"), false, "fallback_must_not_use_unsupported_forced_claim");
  assert.equal(result.packet.body.includes("only"), false, "fallback_must_not_use_unsupported_only_claim");
  assert.equal(result.packet.body.includes("winning"), false, "fallback_must_not_use_unsupported_winning_claim");
  assert.equal(result.packet.visualRecipeRefs.length, 0, "resolver_shell_must_not_render_visual_recipes");
  assert.equal(result.packet.body.includes("Nf3"), false, "plain_hidden_body_must_not_leak_target_san");
  assert.equal(result.packet.body.includes("g1f3"), false, "plain_hidden_body_must_not_leak_target_uci");
  assert.equal((result.packet.hint ?? "").includes("Nf3"), false, "plain_hidden_hint_must_not_leak_target_san");
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
  assert.equal(showMore.kind, "safe_fallback", "show_more_path_should_keep_safe_fallback");
  if (showMore.kind === "safe_fallback") {
    assert.equal((showMore.packet.showMore ?? "").includes("Book rank #2"), true, "show_more_may_include_runtime_rank");
    assert.equal((showMore.packet.showMore ?? "").includes("9,988 games"), true, "show_more_may_include_runtime_games");
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
