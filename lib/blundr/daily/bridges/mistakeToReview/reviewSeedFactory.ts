import {
  createDeterministicIdentity,
  type CardFingerprint,
  type LearningFinding,
} from "@/lib/blundr/contracts";
export type ReviewSeed = {
  reviewCardId: string;
  cardFingerprint: CardFingerprint;
  positionKey: string;
  openingId: string | null;
  reason: string;
  evidenceIds: string[];
};
export function createReviewSeed(finding: LearningFinding): ReviewSeed {
  return {
    reviewCardId: createDeterministicIdentity("review-card", [
      finding.position.positionKey,
      finding.category,
    ]),
    cardFingerprint: createDeterministicIdentity("card", [
      finding.position.positionKey,
      finding.category,
    ]) as CardFingerprint,
    positionKey: finding.position.positionKey,
    openingId: finding.position.openingId,
    reason: finding.explanation,
    evidenceIds: [finding.source.sourceId],
  };
}
