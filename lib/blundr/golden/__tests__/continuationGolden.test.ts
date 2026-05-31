import assert from "node:assert/strict";

import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
import { assertNoRawLabels } from "../goldenAssertions";

export function testContinuationGolden(): void {
  const packet = buildCoachEvidencePacket({ frameId: "1", fen: "8/8/8/8/8/8/8/4K3 w - - 0 1", viewMode: "freeplay", trainingMode: "continuation", bookStatus: "out_of_book" });
  const coach = decideIntentFirstCoach({ packet, interaction: "show_plan" });
  assertNoRawLabels(coach.body);
  assert.equal(/Strong|Verified|Blundr Brain likes/i.test(coach.body), false);
}
