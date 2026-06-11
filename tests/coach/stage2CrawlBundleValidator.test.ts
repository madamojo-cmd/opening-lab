import assert from "node:assert/strict";

import { validateCrawlBundle } from "../../lib/blundr/stage2/validation/validateCrawlBundle";

function validBundle(): any {
  return {
    version: "0.1.0",
    source: "stage2-lichess-stepdown",
    openingIds: ["italian_game"],
    nodes: [
      {
        openingId: "italian_game",
        nodeKey: "n0",
        ply: 0,
        fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      },
    ],
    candidateMoves: [
      {
        openingId: "italian_game",
        nodeKey: "n0",
        moveUci: "e2e4",
        rank: 1,
        games: 10,
      },
    ],
  };
}

export function testStage2CrawlBundleValidator(): void {
  const good = validateCrawlBundle(validBundle());
  assert.equal(good.ok, true);
  assert.equal(good.errors.length, 0);

  const missingVersion = validBundle();
  delete missingVersion.version;
  const missingVersionResult = validateCrawlBundle(missingVersion);
  assert.equal(missingVersionResult.ok, false);
  assert.equal(missingVersionResult.errors.some((e) => e.code === "invalid_version"), true);

  const wrongSource = validBundle();
  wrongSource.source = "other-source";
  const wrongSourceResult = validateCrawlBundle(wrongSource);
  assert.equal(wrongSourceResult.ok, false);
  assert.equal(wrongSourceResult.errors.some((e) => e.code === "invalid_source"), true);

  const invalidUci = validBundle();
  invalidUci.candidateMoves[0].moveUci = "baduci";
  const invalidUciResult = validateCrawlBundle(invalidUci);
  assert.equal(invalidUciResult.ok, false);
  assert.equal(invalidUciResult.errors.some((e) => e.code === "invalid_candidate_move_uci"), true);

  const duplicateNode = validBundle();
  duplicateNode.nodes.push({ openingId: "italian_game", nodeKey: "n0", ply: 1 });
  const duplicateNodeResult = validateCrawlBundle(duplicateNode);
  assert.equal(duplicateNodeResult.ok, false);
  assert.equal(duplicateNodeResult.errors.some((e) => e.code === "duplicate_node_key"), true);

  const duplicateCandidate = validBundle();
  duplicateCandidate.candidateMoves.push({ openingId: "italian_game", nodeKey: "n0", moveUci: "e2e4" });
  const duplicateCandidateResult = validateCrawlBundle(duplicateCandidate);
  assert.equal(duplicateCandidateResult.ok, false);
  assert.equal(duplicateCandidateResult.errors.some((e) => e.code === "duplicate_candidate_key"), true);

  const unknownFields = validBundle();
  unknownFields.someExtra = true;
  unknownFields.nodes[0].conceptId = "ignored";
  unknownFields.candidateMoves[0].planType = "ignored";
  const unknownFieldsResult = validateCrawlBundle(unknownFields);
  assert.equal(unknownFieldsResult.ok, true);
  assert.equal(unknownFieldsResult.warnings.some((w) => w.code === "unknown_field"), true);

  const optionalMissing = {
    version: "0.2.0",
    source: "stage2-lichess-stepdown",
    openingIds: ["italian_game"],
    nodes: [{ openingId: "italian_game", nodeKey: "n0", ply: 0 }],
    candidateMoves: [{ openingId: "italian_game", nodeKey: "n0", moveUci: "e2e4" }],
  };
  const optionalMissingResult = validateCrawlBundle(optionalMissing);
  assert.equal(optionalMissingResult.ok, true);

  const semanticNoise = validBundle();
  semanticNoise.nodes[0].tactic = "fork";
  semanticNoise.nodes[0].concept = "center_control";
  semanticNoise.candidateMoves[0].copy = "Play this";
  const semanticNoiseResult = validateCrawlBundle(semanticNoise);
  assert.equal(semanticNoiseResult.ok, true);
  assert.equal(semanticNoiseResult.errors.length, 0);
  assert.equal(semanticNoiseResult.warnings.some((w) => w.code === "unknown_field"), true);
}

testStage2CrawlBundleValidator();
console.log("stage2CrawlBundleValidator ok");
