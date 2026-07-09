import assert from "node:assert/strict";

import {
  buildNestedDailyRingLayout,
  getNestedDailyRingStyle,
  normalizeNestedDailyRingItems,
  NESTED_DAILY_RING_CENTER,
  NESTED_DAILY_RING_CENTER_SIZE,
  NESTED_DAILY_RING_VIEW_BOX,
  type NestedDailyRingItem,
} from "../NestedDailyRings";

function buildRings(blundrProgress: number, blundrGoal: number): NestedDailyRingItem[] {
  return [
    { ringId: "daily_tempo", label: "Tempo", progress: 0, goal: 5, percent: 0, closed: false },
    { ringId: "daily_battery", label: "Battery", progress: 0, goal: 3, percent: 0, closed: false },
    {
      ringId: "daily_blundr",
      label: "Blundr",
      progress: blundrProgress,
      goal: blundrGoal,
      percent: blundrGoal > 0 ? Math.round((blundrProgress / blundrGoal) * 100) : 0,
      closed: blundrProgress >= blundrGoal,
    },
  ];
}

function main(): void {
  const incomplete = normalizeNestedDailyRingItems(buildRings(0, 1));
  const incompleteBlundr = incomplete.find((ring) => ring.ringId === "daily_blundr");
  assert.ok(incompleteBlundr, "Blundr ring should be present at 0/1");
  assert.equal(incompleteBlundr.progress, 0);
  assert.equal(incompleteBlundr.goal, 1);
  assert.equal(incompleteBlundr.percent, 0);
  assert.equal(incompleteBlundr.closed, false);

  const complete = normalizeNestedDailyRingItems(buildRings(1, 1));
  const completeBlundr = complete.find((ring) => ring.ringId === "daily_blundr");
  assert.ok(completeBlundr, "Blundr ring should be present at 1/1");
  assert.equal(completeBlundr.percent, 100);
  assert.equal(completeBlundr.closed, true);

  const layout = buildNestedDailyRingLayout(complete);
  assert.equal(layout.length, 3);
  assert.equal(layout.every((ring) => ring.centerX === NESTED_DAILY_RING_CENTER && ring.centerY === NESTED_DAILY_RING_CENTER), true);
  assert.equal(layout.every((ring) => ring.viewBoxSize === NESTED_DAILY_RING_VIEW_BOX), true);
  assert.equal(layout.every((ring) => ring.centerCardSize === NESTED_DAILY_RING_CENTER_SIZE), true);
  assert.ok(layout[0].radius > layout[1].radius && layout[1].radius > layout[2].radius, "ring radii should descend outer -> middle -> inner");
  assert.ok(layout[0].radius - layout[0].width / 2 > layout[1].radius + layout[1].width / 2, "outer and middle rings should have a positive gap");
  assert.ok(layout[1].radius - layout[1].width / 2 > layout[2].radius + layout[2].width / 2, "middle and inner rings should have a positive gap");
  assert.ok(NESTED_DAILY_RING_CENTER_SIZE < 2 * (layout[2].radius - layout[2].width / 2), "center card should not cover the inner ring");
  assert.equal(layout[2].statusLabel, "Complete");

  const blundrStyle = getNestedDailyRingStyle({ ringId: "daily_blundr" }, 2);
  assert.equal(Boolean(blundrStyle.track), true);
  assert.equal(Boolean(blundrStyle.stroke), true);
  assert.equal(Boolean(blundrStyle.glowRgb), true);
  assert.match(blundrStyle.track, /^#/);
  assert.match(blundrStyle.stroke, /^#/);
  assert.ok(blundrStyle.size > 96, "Blundr ring must be larger than the center card so it cannot be hidden");

  const reordered = normalizeNestedDailyRingItems([
    buildRings(1, 1)[2],
    buildRings(1, 1)[0],
    buildRings(1, 1)[1],
  ]);
  assert.equal(reordered.some((ring) => ring.ringId === "daily_blundr"), true);
  assert.equal(getNestedDailyRingStyle(reordered[0], 0).stroke, blundrStyle.stroke);
}

main();
console.log("nestedDailyRings.test.ts passed");
