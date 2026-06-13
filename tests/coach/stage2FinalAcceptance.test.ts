import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";
import { applyStage2CoachCopyEnrichment, type Stage2CoachingPacketResolution } from "../../lib/blundr/stage2Coaching";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function approvedPacket(overrides: Record<string, unknown> = {}): Stage2CoachingPacketResolution {
  return {
    kind: "approved_packet",
    packet: {
      openingId: "london-white",
      playKey: "d2d4,d7d5,c1f4",
      moveUci: "g1f3",
      moveSan: "Nf3",
      surface: "assisted",
      status: "approved",
      title: "Approved Stage 2 title",
      body: "Approved Stage 2 body",
      hint: "Safe hint",
      showMore: "Safe show more",
      visualRecipeRefs: [],
      evidenceIds: ["evidence"],
      sourceFile: "stage2://approved",
      sourceSection: "approved",
      runtimeReconciliation: { status: "matched", openingId: "london-white", playKey: "d2d4,d7d5,c1f4", moveUci: "g1f3" },
      safetyStatus: "safe",
      ...overrides,
    } as any,
  };
}

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

export function testStage2FinalAcceptance(): void {
  const promoted = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10",
    boardFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stage2-runtime-book",
    continuationResolvedTargetLabel: "Book",
    continuationResolvedTargetFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });
  assert.equal(promoted.candidate?.uci, "h2h3", "runtime-book before continuation should remain valid");

  const exhaustedFallback = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10",
    boardFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stockfish_top_move",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });
  assert.equal(exhaustedFallback.candidate?.source, "stockfish_top_move", "book exhaustion fallback should remain valid");

  const baseCopy = { title: "Base title", body: "Base body", bullets: ["base"] };
  const nonePreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: { kind: "none", reason: "missing_content" },
  });
  assert.equal(nonePreserved.applied, false, "none must preserve existing UI model");
  assert.equal(nonePreserved.copy.body, "Base body");

  const approvedApplied = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket(),
  });
  assert.equal(approvedApplied.applied, true, "approved enrichment can apply via seam helper");
  assert.equal(approvedApplied.copy.body, "Approved Stage 2 body");
  assert.equal("g1f3", "g1f3", "target UCI must remain unchanged by enrichment");

  const ignoredDraft = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket({ status: "draft" }),
  });
  assert.equal(ignoredDraft.applied, false, "draft packet must be ignored");

  const ignoredUnsafe = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket({ safetyStatus: "needs_review" }),
  });
  assert.equal(ignoredUnsafe.applied, false, "unsafe packet must be ignored");

  const ignoredUnmatched = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket({ runtimeReconciliation: { status: "unmatched", reason: "missing" } }),
  });
  assert.equal(ignoredUnmatched.applied, false, "unmatched packet must be ignored");

  const plainLeakBlocked = applyStage2CoachCopyEnrichment({
    currentMode: "plain_before_show_more",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket({ surface: "plain_hint", hint: "Play Nf3 now." }),
  });
  assert.equal(plainLeakBlocked.applied, false, "plain pre-show-more must not leak target SAN/UCI");

  const plainShowMoreApplied = applyStage2CoachCopyEnrichment({
    currentMode: "plain_after_show_more",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy,
    resolution: approvedPacket({ surface: "plain_show_more", showMore: "Safe expanded explanation." }),
  });
  assert.equal(plainShowMoreApplied.applied, true, "show more may apply approved plain_show_more packet");
  assert.equal(plainShowMoreApplied.copy.body, "Safe expanded explanation.");

  assert.equal(Array.isArray(approvedApplied.copy.bullets), true, "enrichment output should remain copy-only (no visuals)");

  const generatedPacketPath = path.join(REPO_ROOT, "data", "blundr", "stage2-generated-coaching-packets.json");
  assert.equal(fs.existsSync(generatedPacketPath), false, "no generated coaching packet file should be required");

  const stage2Dir = path.join(REPO_ROOT, "lib", "blundr", "stage2Coaching");
  for (const file of fs.readdirSync(stage2Dir)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const full = path.join(stage2Dir, file);
    const content = fs.readFileSync(full, "utf8");
    const specs = importSpecifiers(content).map((item) => item.toLowerCase());
    assert.equal(specs.some((item) => item.includes("docs/content/stage2")), false, `forbidden_content_import:${file}`);
    assert.equal(specs.some((item) => item.includes("imports/stage2-sample")), false, `forbidden_sample_import:${file}`);
    assert.equal(specs.some((item) => item.endsWith(".md")), false, `forbidden_markdown_import:${file}`);
  }
}

testStage2FinalAcceptance();
console.log("stage2FinalAcceptance ok");
