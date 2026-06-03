import assert from "node:assert/strict";
import fs from "node:fs";

const NULL_TARGET_KINDS = new Set([
  "opponent_replying",
  "terminal",
  "transitioning",
  "branch_complete",
  "blocked",
]);

const GUIDED_TARGET_KINDS = new Set([
  "guided_move",
  "lichess_branch_move",
  "adaptive_branch_move",
  "continuation_candidate",
]);

function loadFixtures(): any {
  const raw = fs.readFileSync(new URL("../../data/goldenCoachPositions.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

function isValidUci(uci: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci);
}

export function testGoldenPositions(): void {
  const payload = loadFixtures();
  assert.equal(payload.version, "v2.8.0");
  assert.ok(Array.isArray(payload.fixtures));
  assert.equal(payload.fixtures.length, 25);

  const ids = new Set<string>();

  for (const fixture of payload.fixtures) {
    assert.equal(typeof fixture.id, "string");
    assert.equal(ids.has(fixture.id), false, `duplicate fixture id: ${fixture.id}`);
    ids.add(fixture.id);

    assert.equal(typeof fixture.category, "string");
    assert.equal(typeof fixture.fen, "string");
    assert.ok(Array.isArray(fixture.moveSequence));
    assert.equal(typeof fixture.frameKind, "string");
    assert.ok(Array.isArray(fixture.displayModes));
    assert.ok(Array.isArray(fixture.mustIncludeConcepts));
    assert.ok(Array.isArray(fixture.mustNotIncludeTerms));
    assert.ok(Array.isArray(fixture.plainMustNotInclude));

    const hasTarget = typeof fixture.targetUci === "string" && fixture.targetUci.length > 0;
    if (GUIDED_TARGET_KINDS.has(fixture.frameKind)) {
      assert.equal(hasTarget, true, `${fixture.id} expected targetUci`);
      assert.equal(isValidUci(fixture.targetUci), true, `${fixture.id} invalid UCI`);
      assert.equal(typeof fixture.expectedPiece, "string", `${fixture.id} expectedPiece missing`);
      assert.equal(typeof fixture.expectedSan, "string", `${fixture.id} expectedSan missing`);
    }

    if (NULL_TARGET_KINDS.has(fixture.frameKind)) {
      assert.equal(hasTarget, false, `${fixture.id} null-target frame should not require targetUci`);
    }

    if (hasTarget) {
      const from = fixture.targetUci.slice(0, 2);
      const to = fixture.targetUci.slice(2, 4);
      const lowerTerms = fixture.plainMustNotInclude.map((x: string) => String(x).toLowerCase());

      assert.ok(lowerTerms.includes(fixture.targetUci.toLowerCase()), `${fixture.id} plainMustNotInclude missing UCI`);
      assert.ok(lowerTerms.includes(from.toLowerCase()), `${fixture.id} plainMustNotInclude missing from square`);
      assert.ok(lowerTerms.includes(to.toLowerCase()), `${fixture.id} plainMustNotInclude missing to square`);
      if (fixture.expectedSan) {
        assert.ok(lowerTerms.includes(String(fixture.expectedSan).toLowerCase()), `${fixture.id} plainMustNotInclude missing SAN`);
      }
    }
  }
}

testGoldenPositions();
console.log("goldenPositions ok");
