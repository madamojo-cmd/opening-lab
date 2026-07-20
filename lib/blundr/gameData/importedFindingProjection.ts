import type { OpeningAccessSnapshot } from "@/lib/blundr/contracts";
import type { ExtractedFinding } from "./gameDataTypes";

export type ImportedFindingLearningEventInput = {
  userId: string;
  sessionId: string;
  attemptId: string;
  source: "imported_game";
  taxonomy: "move_incorrect";
  position: ExtractedFinding["position"];
  correct: false;
  firstAttempt: true;
  now: string;
  access: OpeningAccessSnapshot;
  explanation: string;
};

export function buildImportedFindingLearningEventInput(
  userId: string,
  finding: ExtractedFinding,
): ImportedFindingLearningEventInput | null {
  if (
    finding.status !== "active" ||
    !finding.position.openingId ||
    !finding.position.moveOrderKey ||
    !finding.position.expectedMoveUci ||
    (finding.position.repertoireSide !== "white" &&
      finding.position.repertoireSide !== "black")
  )
    return null;

  return {
    userId,
    sessionId: finding.segmentId,
    attemptId: finding.findingId,
    source: "imported_game",
    taxonomy: "move_incorrect",
    position: finding.position,
    correct: false,
    firstAttempt: true,
    now: finding.source.observedAt,
    access: {
      openingId: finding.position.openingId,
      repertoireSide: finding.position.repertoireSide,
      decision: "active",
      checkedAt: finding.source.observedAt,
      authorityVersion: "provider-import-runtime-match-v1",
      expiresAt: null,
    },
    explanation: finding.explanation,
  };
}
