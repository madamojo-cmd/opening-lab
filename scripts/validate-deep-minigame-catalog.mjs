import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { Chess } from "chess.js";

const catalog = JSON.parse(
  await readFile(
    new URL(
      "../lib/blundr/daily/miniGames/deep/catalog/engineCertifiedCatalog.v1.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const quarantine = JSON.parse(
  await readFile(
    new URL(
      "../lib/blundr/daily/miniGames/deep/catalog/engineCertifiedCatalogQuarantine.v1.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

assert.equal(catalog.metadata.suppliedRecordCount, 920);
assert.equal(catalog.metadata.activeRecordCount, 857);
assert.equal(catalog.metadata.quarantinedRecordCount, 63);
assert.equal(catalog.metadata.engine, "Stockfish 18 Lite");
assert.equal(catalog.metadata.engineDepth, 8);
assert.equal(catalog.metadata.sourceGeneratorAvailable, false);
assert.equal(catalog.records.length, 857);
assert.equal(quarantine.count, 63);
assert.equal(quarantine.records.length, 63);

const expectedFamilies = { tactic: 320, knight: 360, pawn: 177 };
const counts = { tactic: 0, knight: 0, pawn: 0 };
const activeIds = new Set();
const activeFamilyFens = new Set();

for (const record of catalog.records) {
  assert.ok(record.family in counts, `${record.id}: invalid family`);
  counts[record.family] += 1;
  const identity = `${record.family}:${record.id}`;
  assert.equal(activeIds.has(identity), false, `Duplicate ID ${identity}`);
  activeIds.add(identity);
  const positionIdentity = `${record.family}:${record.fen}`;
  assert.equal(
    activeFamilyFens.has(positionIdentity),
    false,
    `${identity}: duplicate active family/FEN`,
  );
  activeFamilyFens.add(positionIdentity);

  const { checksum, ...core } = record;
  assert.equal(
    crypto.createHash("sha256").update(JSON.stringify(core)).digest("hex"),
    checksum,
    `${identity}: checksum mismatch`,
  );
  assert.equal(record.evaluation.depth, 8, `${identity}: wrong depth`);
  assert.ok(record.evaluation.multipv >= 1, `${identity}: missing MultiPV`);
  assert.ok(record.source.includes("Stockfish"), `${identity}: source missing`);
  assert.ok(record.pieces >= 11 && record.pieces <= 32);
  assert.ok(record.legalMoves >= 8);

  const chess = new Chess(record.fen);
  assert.equal(chess.isGameOver(), false, `${identity}: terminal start`);
  assert.equal(chess.moves().length, record.legalMoves);
  if (record.family === "pawn") {
    assert.ok(record.pieces <= 18);
    assert.equal(
      chess
        .board()
        .flat()
        .filter(Boolean)
        .some((piece) => !["k", "p"].includes(piece.type)),
      false,
      `${identity}: non king/pawn piece`,
    );
  }

  const applied = [];
  for (const step of record.solution) {
    const legal = chess
      .moves({ verbose: true })
      .find(
        (move) =>
          `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase() ===
          step.uci.toLowerCase(),
      );
    assert.ok(legal, `${identity}: illegal solution ply ${step.uci}`);
    assert.equal(legal.san, step.san, `${identity}: SAN mismatch`);
    assert.equal(legal.piece, step.piece, `${identity}: piece mismatch`);
    assert.equal(legal.color, step.color, `${identity}: color mismatch`);
    applied.push(legal);
    chess.move(legal);
  }
  const learner = applied.filter((_, index) => index % 2 === 0);
  assert.ok(learner.length >= 2, `${identity}: not multi-decision`);
  if (record.family === "tactic")
    assert.ok([2, 3].includes(learner.length), `${identity}: tactic depth`);
  if (record.family === "knight") {
    assert.equal(applied.length, 5, `${identity}: knight line depth`);
    assert.ok(
      learner.filter((move) => move.piece === "n").length >= 2,
      `${identity}: weak knight route`,
    );
  }
  if (record.family === "pawn")
    assert.ok([3, 4, 5].includes(learner.length), `${identity}: pawn depth`);
}

assert.deepEqual(counts, expectedFamilies);
for (const item of quarantine.records) {
  assert.ok(
    activeIds.has(`${item.family}:${item.retainedId}`),
    `${item.id}: retained record does not exist`,
  );
  assert.ok(
    activeFamilyFens.has(`${item.family}:${item.fen}`),
    `${item.id}: retained FEN does not exist`,
  );
  assert.equal(item.reason, "duplicate_start_position_within_family");
}

console.log(
  "Deep minigame catalog valid: 857 active legal lines, 63 linked quarantines, 920 supplied records accounted for.",
);
