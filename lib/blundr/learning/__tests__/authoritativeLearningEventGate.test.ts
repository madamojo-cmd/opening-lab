import assert from "node:assert/strict";
import test from "node:test";
import {
  AuthoritativeLearningEventGate,
  type LearningEvent,
} from "../learningEvents";

const event = (id: string): LearningEvent => ({
  id,
  type: "move_correct",
  source: "train",
  createdAt: "2026-08-06T00:00:00.000Z",
  sessionId: "session-1",
  fen: "fen",
});

test("authoritative gate commits only after a persisted response and retains it", async () => {
  const gate = new AuthoritativeLearningEventGate();
  const result = await gate.persist(
    "frame-1:correct",
    () => event("event-1"),
    async () => ({
      status: "persisted",
      response: { status: "inserted", eventId: "event-1" },
    }),
  );
  assert.equal(result.status, "accepted");
  assert.equal(result.receipt?.response?.eventId, "event-1");
});

test("failure keeps the exact event identity for a retry", async () => {
  const gate = new AuthoritativeLearningEventGate();
  const sent: string[] = [];
  const first = await gate.persist(
    "frame-1:reveal",
    () => event("reveal-1"),
    async (input) => {
      sent.push(input.id);
      throw new Error("offline");
    },
  );
  const retry = await gate.persist(
    "frame-1:reveal",
    () => event("replacement-must-not-be-used"),
    async (input) => {
      sent.push(input.id);
      return {
        status: "duplicate",
        response: { status: "duplicate", eventId: input.id },
      };
    },
  );
  assert.equal(first.status, "failed");
  assert.equal(retry.status, "accepted");
  assert.deepEqual(sent, ["reveal-1", "reveal-1"]);
});

test("an in-flight or accepted duplicate cannot advance the same frame twice", async () => {
  const gate = new AuthoritativeLearningEventGate();
  let resolve!: (value: { status: "persisted" }) => void;
  const first = gate.persist(
    "frame-1:correct",
    () => event("event-1"),
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const concurrent = await gate.persist(
    "frame-1:correct",
    () => event("event-2"),
    async () => ({ status: "persisted" }),
  );
  resolve({ status: "persisted" });
  const accepted = await first;
  const duplicate = await gate.persist(
    "frame-1:correct",
    () => event("event-3"),
    async () => ({ status: "persisted" }),
  );
  assert.equal(concurrent.status, "in_flight");
  assert.equal(accepted.status, "accepted");
  assert.equal(duplicate.status, "already_accepted");
  assert.equal(duplicate.event.id, "event-1");
});
