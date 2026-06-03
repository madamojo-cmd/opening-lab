import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import { buildBoardTruth } from "./providers/boardTruthProvider";
import { buildMoveSemanticsClaims } from "./providers/moveSemanticsProvider";
import { buildOpeningContext } from "./providers/openingContextProvider";
import { createProviderHealthMap } from "./providers/providerHealth";
import { buildStrategicFeatureClaims } from "./providers/strategicFeatureProvider";
import { buildTacticalMotifClaims } from "./providers/tacticalMotifProvider";
import { buildVisualEvidenceClaims } from "./providers/visualEvidenceProvider";
import type { CoachEvidenceClaim, EvidenceGraph } from "./types";

function hasStrongOverclaimText(summary: string): boolean {
  const lower = summary.toLowerCase();
  return ["wins material", "forced", "only move"]
    .some((token) => lower.includes(token));
}

function normalizeClaims(claims: CoachEvidenceClaim[]): CoachEvidenceClaim[] {
  return [...claims]
    .map((claim) => ({
      ...claim,
      textSafeSummary: String(claim.textSafeSummary ?? ""),
      machineFacts: claim.machineFacts ?? {},
      provenance: Array.isArray(claim.provenance) ? claim.provenance : [],
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function detectContradictions(input: {
  frame: CurrentInstructionFrame;
  boardTruthTargetLegal: EvidenceGraph["boardTruth"]["targetLegal"];
  claims: CoachEvidenceClaim[];
}): EvidenceGraph["contradictions"] {
  const out: EvidenceGraph["contradictions"] = [];

  if (input.boardTruthTargetLegal !== true) {
    const illegalClaims = input.claims.filter((claim) => claim.strength === "verified").map((claim) => claim.id);
    if (illegalClaims.length > 0) {
      out.push({
        id: `${input.frame.frameKey}:contradiction_illegal_verified`,
        severity: "critical",
        message: "Verified claims present while target legality is not confirmed.",
        claimIds: illegalClaims,
      });
    }
  }

  const targetPiece = String(input.frame.target?.pieceType ?? "").toLowerCase();
  if (targetPiece.startsWith("b")) {
    const knightClaims = input.claims.filter((claim) => String(claim.textSafeSummary).toLowerCase().includes("knight")).map((claim) => claim.id);
    if (knightClaims.length > 0) {
      out.push({
        id: `${input.frame.frameKey}:contradiction_piece_mismatch`,
        severity: "warning",
        message: "Knight-oriented claims present for bishop target.",
        claimIds: knightClaims,
      });
    }
  }

  return out;
}

export function buildEvidenceGraph(input: {
  frame: CurrentInstructionFrame;
  moveSequence?: string[];
  openingKey?: string;
  openingName?: string;
  lineKey?: string;
  lineName?: string;
  expectedMoveReason?: string;
  themeTags?: string[];
  branchComplete?: boolean;
  endOfBook?: boolean;
  continuationEligible?: boolean;
}): EvidenceGraph {
  const frame = input.frame;
  const providerStatus = createProviderHealthMap();

  const openingContext = buildOpeningContext({
    frame,
    moveSequence: input.moveSequence,
    openingKey: input.openingKey,
    openingName: input.openingName,
    lineKey: input.lineKey,
    lineName: input.lineName,
    expectedMoveReason: input.expectedMoveReason,
    themeTags: input.themeTags,
    branchComplete: input.branchComplete,
    endOfBook: input.endOfBook,
    continuationEligible: input.continuationEligible,
  });

  const boardTruth = buildBoardTruth({ frame });

  if (!frame.target) {
    return {
      frameKey: frame.frameKey,
      targetUci: null,
      boardTruth,
      openingContext,
      claims: [],
      deterministicClaims: [],
      tacticClaims: [],
      strategicClaims: [],
      visualEvidence: [],
      blockedClaims: [],
      contradictions: [],
      providerStatus,
      debug: {
        reason: "frame_target_null",
      },
    };
  }

  const moveSemantics = buildMoveSemanticsClaims({ frame, boardTruth, openingContext });
  const tactical = buildTacticalMotifClaims({ frame, boardTruth });
  const strategic = buildStrategicFeatureClaims({ frame, boardTruth, openingContext });
  const preVisualClaims = [...moveSemantics, ...tactical, ...strategic];
  const visual = buildVisualEvidenceClaims({ frame, boardTruth, claims: preVisualClaims });

  const allClaims = normalizeClaims([...preVisualClaims, ...visual]);
  const contradictions = detectContradictions({ frame, boardTruthTargetLegal: boardTruth.targetLegal, claims: allClaims });

  const downgradedClaims = allClaims.map((claim) => {
    if (hasStrongOverclaimText(claim.textSafeSummary)) {
      return {
        ...claim,
        strength: "blocked" as const,
      };
    }
    if (contradictions.some((c) => c.claimIds.includes(claim.id)) && claim.strength === "verified") {
      return {
        ...claim,
        strength: "probable" as const,
      };
    }
    return claim;
  });

  const deterministicClaims = downgradedClaims.filter((claim) => claim.strength === "verified" || claim.strength === "template_safe");
  const tacticClaims = downgradedClaims.filter((claim) => claim.type === "tactical_motif" || claim.type === "check" || claim.type === "checkmate" || claim.type === "capture");
  const strategicClaims = downgradedClaims.filter((claim) => claim.type !== "tactical_motif" && claim.type !== "check" && claim.type !== "checkmate" && claim.type !== "capture");
  const visualEvidence = downgradedClaims.filter((claim) => claim.provenance.some((prov) => prov.source === "visual_evidence"));
  const blockedClaims = downgradedClaims.filter((claim) => claim.strength === "blocked");

  return {
    frameKey: frame.frameKey,
    targetUci: frame.target.uci,
    boardTruth,
    openingContext,
    claims: downgradedClaims,
    deterministicClaims,
    tacticClaims,
    strategicClaims,
    visualEvidence,
    blockedClaims,
    contradictions,
    providerStatus,
    debug: {
      moveSemanticsCount: moveSemantics.length,
      tacticalCount: tactical.length,
      strategicCount: strategic.length,
      visualCount: visual.length,
      boardTruthTargetLegal: boardTruth.targetLegal,
    },
  };
}
