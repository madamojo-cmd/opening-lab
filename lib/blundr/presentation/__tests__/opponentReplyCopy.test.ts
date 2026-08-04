import assert from "node:assert/strict";

import {
  buildOpponentReplyFeedback,
  formatOpponentReplyPercentage,
} from "../opponentReplyCopy";

assert.equal(formatOpponentReplyPercentage(0.6163), "61.6%");
assert.equal(formatOpponentReplyPercentage(null), null);
assert.equal(formatOpponentReplyPercentage(1.1), null);

const normal = buildOpponentReplyFeedback({ san: "e5", playPct: 0.23555 });
assert.equal(
  normal,
  "Opponent played e5. Played in 23.6% of matching Lichess games.",
);
assert.doesNotMatch(normal, /Source:|Variation:|\(\)/);

const varied = buildOpponentReplyFeedback({
  san: "c5",
  playPct: 0.19,
  variationApplied: true,
  blockedThirdRepeatBranches: ["e7e5"],
});
assert.match(varied, /avoid a third consecutive repeat/);

const emptyVariation = buildOpponentReplyFeedback({
  san: "e5",
  variationApplied: true,
  blockedThirdRepeatBranches: [],
});
assert.equal(emptyVariation, "Opponent played e5.");

console.log("opponentReplyCopy ok");
