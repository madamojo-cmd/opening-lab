import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
import { assertNoPlainLeak } from "../goldenAssertions";
import { GOLDEN_POSITIONS } from "../goldenPositions";

export function testPlainViewGolden(): void {
  const g = GOLDEN_POSITIONS.italianBc4;
  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "plain", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian" });
  assertNoPlainLeak(coach.body, g.moveSan);
}
