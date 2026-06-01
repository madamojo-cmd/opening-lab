import assert from "node:assert/strict";
import { selectCoachCopyVariant } from "../coachVariationPolicy";

export function testCoachVariationPolicy(): void {
  const candidates = [
    { utteranceId: "a", utteranceFamily: "f1" },
    { utteranceId: "b", utteranceFamily: "f1" },
    { utteranceId: "c", utteranceFamily: "f2" },
  ] as any;

  const selected = selectCoachCopyVariant(candidates, "p1", [{ patternId: "p1", utteranceId: "a", utteranceFamily: "f1" }] as any);
  assert.notEqual(selected?.entry.utteranceId, "a");

  const repeat = selectCoachCopyVariant([{ utteranceId: "a", utteranceFamily: "f1" }] as any, "p1", [{ patternId: "p1", utteranceId: "a", utteranceFamily: "f1" }] as any);
  assert.equal(repeat?.reason.includes("unavoidable"), true);
}
