import assert from "node:assert/strict";

import {
  PROJECTIVE_TACTIC_REGISTRY,
  getProjectiveTacticLabel,
  isProjectiveTacticEnabledInE,
  type ProjectiveTacticKind,
} from "../../lib/blundr/projectiveTactics";

const allKinds: ProjectiveTacticKind[] = [
  "fork",
  "knight_fork",
  "pin",
  "skewer",
  "discovered_attack",
  "discovered_check",
  "double_attack",
  "xray_attack",
  "battery",
  "overloaded_defender",
  "hanging_piece",
  "trapped_piece",
  "back_rank_weakness",
  "mate_threat",
  "removal_of_defender",
  "deflection",
  "decoy",
  "clearance",
  "interference",
];

assert.deepEqual(Object.keys(PROJECTIVE_TACTIC_REGISTRY).sort(), [...allKinds].sort());
assert.deepEqual(allKinds.filter((kind) => PROJECTIVE_TACTIC_REGISTRY[kind].enabledInE).sort(), ["fork", "knight_fork", "pin"]);
assert.equal(isProjectiveTacticEnabledInE("skewer"), false);

const stageE2: ProjectiveTacticKind[] = [
  "overloaded_defender",
  "trapped_piece",
  "back_rank_weakness",
  "mate_threat",
  "removal_of_defender",
  "deflection",
  "decoy",
  "clearance",
  "interference",
];
for (const kind of stageE2) {
  assert.equal(PROJECTIVE_TACTIC_REGISTRY[kind].enabledInE, false);
}
for (const kind of allKinds) {
  assert.equal(typeof getProjectiveTacticLabel(kind), "string");
  assert.equal(getProjectiveTacticLabel(kind).length > 0, true);
  if (PROJECTIVE_TACTIC_REGISTRY[kind].enabledInE) {
    assert.equal(PROJECTIVE_TACTIC_REGISTRY[kind].confidenceRequired, "high");
  }
}

console.log("projectiveTacticsRegistry ok");
