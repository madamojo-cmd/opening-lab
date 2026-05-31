import assert from "node:assert/strict";

import { findRegistryEntries, OPENING_PLAN_REGISTRY } from "../openingPlanRegistry";

export function testOpeningPlanRegistry(): void {
  assert.equal(OPENING_PLAN_REGISTRY.length >= 5, true);
  assert.equal(findRegistryEntries({ openingId: "italian", conceptId: "castle_for_safety", moveSan: "O-O" })[0]?.planType, "castle_and_connect_rooks");
  assert.equal(findRegistryEntries({ openingId: "italian", conceptId: "prepare_center_break", moveUci: "c2c3" })[0]?.planType, "central_break_preparation");
}
