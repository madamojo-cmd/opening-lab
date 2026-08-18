import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { Chess } from "chess.js";

import { verifyContinuationCheckmatePath } from "../continuationCheckmateAuthority";

const MATE_START_FEN = "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1";
const STALEMATE_START_FEN = "7k/5K2/8/6Q1/8/8/8/8 w - - 0 1";
const OPPONENT_MATE_START_FEN = "8/8/8/8/8/6k1/5q2/7K b - - 0 1";

test("server verifier accepts a legal learner-delivered mate", () => {
  const verified = verifyContinuationCheckmatePath({
    terminalFen: MATE_START_FEN,
    userColor: "w",
    pathUci: ["f7h7"],
  });
  assert.equal(verified.matingMoveUci, "f7h7");
  assert.equal(new Chess(verified.completedFen).isCheckmate(), true);
});

test("server verifier supports a full multi-ply continuation ending in learner mate", () => {
  const start = new Chess();
  const verified = verifyContinuationCheckmatePath({
    terminalFen: start.fen(),
    userColor: "b",
    pathUci: ["f2f3", "e7e5", "g2g4", "d8h4"],
  });
  assert.equal(verified.matingMoveUci, "d8h4");
  assert.equal(new Chess(verified.completedFen).isCheckmate(), true);
});

test("server verifier rejects legal non-mate and stalemate", () => {
  assert.throws(
    () =>
      verifyContinuationCheckmatePath({
        terminalFen: new Chess().fen(),
        userColor: "w",
        pathUci: ["e2e4"],
      }),
    /continuation_checkmate_unverified/,
  );

  assert.throws(
    () =>
      verifyContinuationCheckmatePath({
        terminalFen: STALEMATE_START_FEN,
        userColor: "w",
        pathUci: ["g5g6"],
      }),
    /continuation_checkmate_unverified/,
  );
});

test("server verifier rejects opponent-delivered mate and illegal paths", () => {
  assert.throws(
    () =>
      verifyContinuationCheckmatePath({
        terminalFen: OPPONENT_MATE_START_FEN,
        userColor: "w",
        pathUci: ["f2h2"],
      }),
    /continuation_checkmate_not_learner/,
  );

  assert.throws(
    () =>
      verifyContinuationCheckmatePath({
        terminalFen: new Chess().fen(),
        userColor: "w",
        pathUci: ["e2e5"],
      }),
    /continuation_move_illegal/,
  );
});

test("PR20 migration rewires Battery evidence away from generic continuation rows", () => {
  const sql = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260817203000_blundr_battery_checkmate_authority.sql",
    ),
    "utf8",
  );
  assert.match(sql, /create table public\.blundr_continuation_checkmates_v1/);
  assert.match(sql, /blundr_commit_continuation_checkmate_v1/);
  assert.match(sql, /from public\.blundr_continuation_checkmates_v1 c/);
  assert.match(
    sql,
    /Generic continuation evidence is deliberately not accepted for Battery/,
  );
});
