import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { shouldOfferMaiaOpponentRetry } from "../../lib/blundr/maia/maiaOpponentRetry";

const eligible = {
  trainingMode: "continuation",
  trainerPhase: "error",
  maiaUnavailable: true,
  hasPendingRequest: false,
  gameOver: false,
  opponentToMove: true,
};

test("Maia retry is offered only for a failed continuation opponent turn", () => {
  assert.equal(shouldOfferMaiaOpponentRetry(eligible), true);

  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, trainingMode: "restricted" }),
    false,
  );
  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, trainerPhase: "opponent_replying" }),
    false,
  );
  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, maiaUnavailable: false }),
    false,
  );
  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, hasPendingRequest: true }),
    false,
  );
  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, gameOver: true }),
    false,
  );
  assert.equal(
    shouldOfferMaiaOpponentRetry({ ...eligible, opponentToMove: false }),
    false,
  );
});

test("trainer exposes a same-position retry without substitute opponent moves", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "app/page.tsx"),
    "utf8",
  );

  assert.equal(source.includes("Retry opponent move"), true);
  assert.equal(source.includes("handleRetryMaiaOpponentMove"), true);
  assert.equal(
    source.includes('baseFen: retryFen'),
    true,
    "retry must schedule from the current failed continuation FEN",
  );
  assert.equal(
    source.includes('mode: "continuation"'),
    true,
    "retry must preserve continuation opponent authority",
  );
  assert.equal(
    source.includes('clearRuntimeCriticalIssue("maia_continuation_unavailable")'),
    true,
  );
  assert.equal(
    source.includes("No substitute opponent move was played"),
    true,
    "fail-closed copy must remain explicit",
  );
});
