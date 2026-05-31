import assert from "node:assert/strict";
import { classifyHumanEngineDivergence } from "../humanEngineDivergence";

export function testHumanEngineDivergence(): void {
  assert.equal(classifyHumanEngineDivergence({ moveClass: "natural_good" } as any), "aligned_natural_good");
  assert.equal(classifyHumanEngineDivergence({ moveClass: "predictable_human_mistake" } as any), "human_temptation_bad");
  assert.equal(classifyHumanEngineDivergence({ moveClass: "hard_to_find_good_move" } as any), "engine_move_hard_for_humans");
}
