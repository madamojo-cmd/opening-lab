#!/usr/bin/env node

const baseUrl = process.env.BLUNDR_BASE_URL || "http://127.0.0.1:3200";

function fail(message) {
  console.error(`[smoke] FAIL: ${message}`);
  process.exit(1);
}

async function postVisualModel(payload) {
  const response = await fetch(`${baseUrl}/api/blundr-visual-model`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    fail(`Non-JSON response (${response.status}): ${text.slice(0, 200)}`);
  }
  return { status: response.status, body: json };
}

async function run() {
  console.log(`[smoke] Target: ${baseUrl}`);

  const validPayload = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    openingName: "Smoke Test Opening",
    userColor: "w",
    trainingMode: "restricted",
    trainingPhase: "user_turn",
    expectedMove: { san: "e4", uci: "e2e4" },
    expectedMoves: [{ san: "e4", uci: "e2e4" }],
    bookStatus: "in_book",
    userRatingBucket: "Club",
    coachingMemory: { conceptSeenCount: 0, missedCount: 0, successCount: 0 },
  };

  const fallbackPayload = {
    fen: "invalid fen",
    openingName: "Smoke Test Opening",
    userColor: "w",
    trainingMode: "restricted",
    trainingPhase: "user_turn",
    expectedMoves: [],
    bookStatus: "pending",
    userRatingBucket: "Club",
    coachingMemory: { conceptSeenCount: 0, missedCount: 0, successCount: 0 },
  };

  const valid = await postVisualModel(validPayload);
  if (valid.status !== 200) fail(`Valid payload returned status ${valid.status}`);
  if (valid.body?.suppress?.includes("recommendation_pending")) {
    fail("Valid payload unexpectedly returned recommendation_pending");
  }
  console.log(
    `[smoke] valid: source=${valid.body?.source ?? "n/a"} fallback=${Boolean(valid.body?.fallback)} arrows=${Array.isArray(valid.body?.arrows) ? valid.body.arrows.length : 0} squares=${Array.isArray(valid.body?.squares) ? valid.body.squares.length : 0}`,
  );

  const fallback = await postVisualModel(fallbackPayload);
  if (fallback.status !== 200) fail(`Fallback payload returned status ${fallback.status}`);
  if (!fallback.body?.suppress?.includes("recommendation_pending")) {
    fail("Fallback payload did not include recommendation_pending suppression");
  }
  console.log(
    `[smoke] fallback: source=${fallback.body?.source ?? "n/a"} fallback=${Boolean(fallback.body?.fallback)} suppress=${JSON.stringify(fallback.body?.suppress ?? [])}`,
  );

  console.log("[smoke] PASS");
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
