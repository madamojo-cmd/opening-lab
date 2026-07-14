import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { legalMoves, evidence, validateActivityAccess } from "../activityUtils";
import type {
  CandidateChoiceCandidate,
  CandidateChoiceSolution,
} from "./candidateChoiceTypes";

export function buildCandidateSet(input: {
  userId: string;
  openingId: string;
  side: "white" | "black";
  positionKey: string;
  positionFen: string;
  approvedMoves: readonly string[];
  mistakeMove?: string;
  alternativeMove?: string;
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
  evidenceVersion?: string;
}): ActivityBuildResult<CandidateChoiceSolution> {
  const accessError = validateActivityAccess({ access: input.access });
  if (accessError) return accessError;
  const moves = legalMoves(input.positionFen);
  if (!Array.isArray(moves)) return moves;
  const legal = new Set(moves.map((move) => move.uci));
  const accepted = input.approvedMoves.filter((move) => legal.has(move));
  if (!accepted.length)
    return rejection(
      "missing_approved_content",
      "No approved legal move is available for this position.",
    );
  const mistake =
    input.mistakeMove &&
    legal.has(input.mistakeMove) &&
    !accepted.includes(input.mistakeMove)
      ? input.mistakeMove
      : null;
  const alternative =
    input.alternativeMove &&
    legal.has(input.alternativeMove) &&
    !accepted.includes(input.alternativeMove) &&
    input.alternativeMove !== mistake
      ? input.alternativeMove
      : null;
  if (!mistake || !alternative)
    return rejection(
      "ambiguous_accepted_set",
      "A verified three-way candidate contrast is not available.",
    );
  const version = input.evidenceVersion ?? "candidate-choice-v1";
  const candidates: CandidateChoiceCandidate[] = [
    ...accepted.map((uci) => ({
      id: `approved-${uci}`,
      label: moves.find((move) => move.uci === uci)?.san ?? uci,
      uci,
      evidence: evidence(
        "approved_content",
        input.positionKey,
        version,
        1,
        true,
      ),
    })),
    {
      id: `mistake-${mistake}`,
      label: moves.find((move) => move.uci === mistake)?.san ?? mistake,
      uci: mistake,
      evidence: evidence(
        "imported_game",
        `${input.userId}:${mistake}`,
        version,
        0.35,
        true,
      ),
    },
    {
      id: `alternative-${alternative}`,
      label: moves.find((move) => move.uci === alternative)?.san ?? alternative,
      uci: alternative,
      evidence: evidence("runtime", input.positionKey, version, 0.6, true),
    },
  ];
  return {
    ok: true,
    activityId: "daily_candidate_choice",
    schemaVersion: "2026-07-13.v1",
    generatorVersion: "candidate-choice-generator-v1",
    validatorVersion: "candidate-choice-validator-v1",
    cardFingerprint: buildActivityIdentity(
      "daily_candidate_choice",
      input.positionKey,
      input.positionKey,
    ),
    positionKey: input.positionKey,
    openingId: input.openingId,
    side: input.side,
    evidence: candidates.map((candidate) => candidate.evidence),
    solution: {
      acceptedIds: candidates
        .filter((candidate) => accepted.includes(candidate.uci))
        .map((candidate) => candidate.id),
      candidates,
      feedbackById: Object.fromEntries(
        candidates.map((candidate) => [
          candidate.id,
          accepted.includes(candidate.uci)
            ? "This move preserves the approved plan for the exact position."
            : candidate.id.startsWith("mistake")
              ? "This practical mistake gives the opponent a clear improvement."
              : "This legal alternative is playable but loses the prepared contrast.",
        ]),
      ),
    },
  };
}
