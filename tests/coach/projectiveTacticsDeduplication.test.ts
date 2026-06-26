import assert from "node:assert/strict";

import {
  buildProjectiveTacticIdentityKey,
  detectProjectiveTactics,
  filterNewProjectiveTactics,
} from "../../lib/blundr/projectiveTactics";

const firstPin = detectProjectiveTactics({
  fen: "7k/3q4/2n5/1B6/8/8/8/4K3 b - - 0 1",
  lastMoveUci: "a4b5",
  learnerColor: "w",
  movedColor: "w",
}).visuals;
assert.equal(firstPin.length, 1);
assert.equal(firstPin[0].kind, "pin");

const firstFilter = filterNewProjectiveTactics({ visuals: firstPin, seenKeys: new Set() });
assert.equal(firstFilter.newVisuals.length, 1);

const continuingPin = detectProjectiveTactics({
  fen: "7k/3q4/2n5/8/B7/8/8/4K3 b - - 0 1",
  lastMoveUci: "b5a4",
  learnerColor: "w",
  movedColor: "w",
}).visuals;
assert.equal(continuingPin.length, 1);
assert.equal(buildProjectiveTacticIdentityKey(firstPin[0]), buildProjectiveTacticIdentityKey(continuingPin[0]));

const continuingFilter = filterNewProjectiveTactics({
  visuals: continuingPin,
  seenKeys: firstFilter.nextSeenKeys,
});
assert.equal(continuingFilter.newVisuals.length, 0);

const fork = detectProjectiveTactics({
  fen: "k2q4/8/8/8/b2R4/8/8/7K w - - 0 1",
  lastMoveUci: "d1d4",
  learnerColor: "w",
  movedColor: "w",
}).visuals;
assert.equal(fork.length, 1);
assert.equal(filterNewProjectiveTactics({ visuals: fork, seenKeys: continuingFilter.nextSeenKeys }).newVisuals.length, 1);

const firstFork = filterNewProjectiveTactics({ visuals: fork, seenKeys: new Set() });
assert.equal(firstFork.newVisuals.length, 1);
assert.equal(filterNewProjectiveTactics({ visuals: fork, seenKeys: firstFork.nextSeenKeys }).newVisuals.length, 0);
assert.equal(filterNewProjectiveTactics({ visuals: fork, seenKeys: new Set() }).newVisuals.length, 1);

console.log("projectiveTacticsDeduplication ok");
