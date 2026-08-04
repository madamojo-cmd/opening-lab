import assert from "node:assert/strict";
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

test("production selection returns exactly five board cards and excludes choices", () => {
  const cards = [
    ["recall", "p1", "move", 9],
    ["choice", "p2", "choice", 100],
    ["repair", "p2", "move", 8],
    ["continuation", "p3", "move", 7],
    ["recall", "p4", "move", 6],
    ["repair", "p5", "move", 5],
    ["recall", "p6", "move", 4],
  ].map(([activityId, positionKey, interaction, priority]) => ({
    publicCard: {
      activityId: String(activityId),
      positionKey: String(positionKey),
      interaction: interaction as "move" | "choice",
    },
    priority: Number(priority),
    stableKey: `${activityId}:${positionKey}`,
  }));
  const selected = selectProductionDailyBoardCards(cards);
  assert.equal(selected.length, 5);
  assert.ok(selected.every((card) => card.publicCard.interaction === "move"));
  assert.equal(
    new Set(selected.map((card) => card.publicCard.positionKey)).size,
    5,
  );
});

test("production selection fails closed when five board positions do not exist", () => {
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
      ),
    /daily_board_deck_incomplete/,
  );
});
