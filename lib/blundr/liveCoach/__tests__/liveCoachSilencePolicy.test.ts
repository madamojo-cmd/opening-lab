import assert from "node:assert/strict";
import { shouldLiveCoachStaySilent } from "../liveCoachSilencePolicy";

export function testLiveCoachSilencePolicy(): void {
  const stale = shouldLiveCoachStaySilent({
    evidence: { stale: true },
    selected: null,
  } as any);
  assert.equal(stale.silent, true);

  const low = shouldLiveCoachStaySilent({
    evidence: { stale: false },
    selected: { opportunity: "center_decision", confidenceScore: 0.3, pedagogicalValue: 0.5 },
  } as any);
  assert.equal(low.silent, true);

  const speak = shouldLiveCoachStaySilent({
    evidence: { stale: false },
    selected: { opportunity: "hard_to_find_good_move", confidenceScore: 0.8, pedagogicalValue: 0.9 },
    userRequestedHelp: true,
  } as any);
  assert.equal(speak.silent, false);
}
