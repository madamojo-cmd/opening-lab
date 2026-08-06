import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Chess } from "chess.js";

import { selectProductionDailyBoardCards } from "../productionDailyDeckSelection";
import {
  runtimeSequenceToFen,
  splitRuntimeMoveSequence,
} from "../runtimeSequence";

test("runtime sequence reconstruction accepts canonical comma and whitespace delimiters", () => {
  const comma = "e2e4,e7e5,g1f3,b8c6";
  const whitespace = "e2e4 e7e5\ng1f3\tb8c6";
  assert.deepEqual(splitRuntimeMoveSequence(comma), [
    "e2e4",
    "e7e5",
    "g1f3",
    "b8c6",
  ]);
  assert.equal(runtimeSequenceToFen(comma), runtimeSequenceToFen(whitespace));

  const expected = new Chess();
  for (const move of ["e2e4", "e7e5", "g1f3", "b8c6"])
    expected.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
  assert.equal(runtimeSequenceToFen(comma), expected.fen());
});

test("production selection preserves a move recall and supports server-selected stack sizes", () => {
  const cards = [
    ["daily_move_recall", "p1", "move", 9],
    ["choice", "p2", "choice", 100],
    ["repair", "p2", "move", 8],
    ["continuation", "p3", "move", 7],
    ["daily_move_recall", "p4", "move", 6],
    ["repair", "p5", "move", 5],
    ["daily_move_recall", "p6", "move", 4],
  ].map(([activityId, positionKey, interaction, priority]) => ({
    publicCard: {
      activityId: String(activityId),
      positionKey: String(positionKey),
      interaction: interaction as "move" | "choice",
    },
    priority: Number(priority),
    stableKey: `${activityId}:${positionKey}`,
  }));
  for (const limit of [3, 4, 5]) {
    const selected = selectProductionDailyBoardCards(cards, limit);
    assert.equal(selected.length, limit);
    assert.equal(selected[0]?.publicCard.activityId, "daily_move_recall");
    assert.equal(
      new Set(selected.map((card) => card.publicCard.positionKey)).size,
      limit,
    );
  }
});

test("production selection accepts choice tasks and supports stacks larger than five", () => {
  const cards = Array.from({ length: 12 }, (_, index) => ({
    publicCard: {
      activityId: index === 0 ? "daily_move_recall" : "daily_candidate_choice",
      positionKey: `p${index}`,
      interaction: index % 2 ? ("choice" as const) : ("move" as const),
    },
    priority: 12 - index,
    stableKey: `card-${index}`,
  }));
  const selected = selectProductionDailyBoardCards(cards, 12);
  assert.equal(selected.length, 12);
  assert.ok(selected.some((card) => card.publicCard.interaction === "choice"));
});

test("production selection fails closed when verified unlocked runtime fallback is insufficient", () => {
  assert.throws(
    () =>
      selectProductionDailyBoardCards(
        Array.from({ length: 4 }, (_, index) => ({
          publicCard: {
            activityId: "recall",
            positionKey: `p${index}`,
            interaction: "move" as const,
          },
          priority: 1,
          stableKey: String(index),
        })),
        5,
      ),
    /daily_runtime_fallback_insufficient/,
  );
});

function sourcedCards(personalized: number, fallback: number) {
  return [
    ...Array.from({ length: personalized }, (_, index) => ({
      publicCard: {
        activityId: index === 0 ? "daily_move_recall" : "daily_plan_recall",
        positionKey: `evidence-${index}`,
        interaction: "move" as const,
      },
      priority: 100 - index,
      stableKey: `evidence-${index}`,
      source: "personalized" as const,
    })),
    ...Array.from({ length: fallback }, (_, index) => ({
      publicCard: {
        activityId:
          personalized === 0 && index === 0
            ? "daily_move_recall"
            : "daily_candidate_choice",
        positionKey: `runtime-${index}`,
        interaction: index % 2 ? ("choice" as const) : ("move" as const),
      },
      priority: 1,
      stableKey: `runtime-${index}`,
      source: "unlocked_runtime" as const,
    })),
  ];
}

test("a no-history user receives one unified stack from verified unlocked runtime", () => {
  const selected = selectProductionDailyBoardCards(sourcedCards(0, 8), 5);
  assert.equal(selected.length, 5);
  assert.ok(selected.every((card) => card.source === "unlocked_runtime"));
});

test("personalized evidence is selected before unlocked-runtime fallback", () => {
  const selected = selectProductionDailyBoardCards(sourcedCards(2, 8), 5);
  assert.equal(selected.length, 5);
  assert.equal(
    selected.filter((card) => card.source === "personalized").length,
    2,
  );
  assert.equal(
    selected.filter((card) => card.source === "unlocked_runtime").length,
    3,
  );
});

test("a fully evidence-backed stack does not consume fallback content", () => {
  const selected = selectProductionDailyBoardCards(sourcedCards(8, 8), 5);
  assert.ok(selected.every((card) => card.source === "personalized"));
});

test("production composer contains no mixed minigame or fabricated mistake path", () => {
  const source = readFileSync(
    new URL("../productionDailyService.server.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /buildPunishmentActivity|daily_mixed_test|daily_repair_line/,
  );
  assert.doesNotMatch(source, /kind:\s*["']mini_game["']/);
});

test("production Daily delegates learning projections to the shared v2 authority without coercing task answers into moves", () => {
  const source = readFileSync(
    new URL("../productionDailyService.server.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /prepareLearningEventV2/);
  assert.doesNotMatch(source, /buildLearningProjection/);
  assert.match(source, /task_evidence/);
  assert.match(source, /submittedAnswerIdentity/);
  assert.match(source, /expectedTaskAnswerIdentity/);
  assert.match(source, /playedMoveUci:\s*isMoveTask/);
  assert.match(source, /input\.card\.interaction === "move"/);
});

test("the active Daily browser submits only reserved actions and never owns rewards", () => {
  const screen = readFileSync(
    new URL(
      "../../../components/daily/ProductionDailyBlundrScreen.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(screen, /cardFingerprint: currentCard\.cardFingerprint/);
  assert.match(screen, /actionId: currentCard\.actionId/);
  assert.doesNotMatch(
    screen,
    /recordBlundrTaskCompleted|completeDailyRingActivity|applyRewardCompletion/,
  );
});
