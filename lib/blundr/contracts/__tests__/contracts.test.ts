import assert from "node:assert/strict";
import test from "node:test";
import {
  BLUNDR_CONTRACT_VERSION,
  FEATURE_FLAGS,
  createDeterministicIdentity,
  createPositionIdentity,
  hasSolutionBearingFields,
  isFailClosedAccess,
  parseVersionedContract,
  serializeContract,
} from "..";

test("shared contracts create stable separated identities", () => {
  const a = createPositionIdentity({
    canonicalFen: "fen",
    openingId: "italian-white",
    repertoireSide: "white",
    expectedMoveUci: "e2e4",
    moveOrderKey: "a",
  });
  const b = createPositionIdentity({
    canonicalFen: "fen",
    openingId: "italian-white",
    repertoireSide: "white",
    expectedMoveUci: "g1f3",
    moveOrderKey: "b",
  });
  assert.notEqual(a.positionKey, b.positionKey);
  assert.notEqual(a.moveOrderKey, b.moveOrderKey);
  assert.equal(
    createDeterministicIdentity("event", ["a", 1]),
    createDeterministicIdentity("event", ["a", 1]),
  );
});
test("shared contracts round trip and reject unsupported versions", () => {
  const value = { schemaVersion: BLUNDR_CONTRACT_VERSION, value: "ok" };
  assert.deepEqual(parseVersionedContract(serializeContract(value)), value);
  assert.throws(
    () =>
      parseVersionedContract(
        JSON.stringify({ ...value, schemaVersion: "old" }),
      ),
    /unsupported_contract_version/,
  );
});
test("shared contracts fail closed for missing, stale, and non-active access", () => {
  assert.equal(isFailClosedAccess(null), true);
  assert.equal(
    isFailClosedAccess({
      openingId: "x",
      repertoireSide: "white",
      decision: "unknown",
      checkedAt: new Date().toISOString(),
      authorityVersion: "v1",
      expiresAt: null,
    }),
    true,
  );
  assert.equal(
    isFailClosedAccess({
      openingId: "x",
      repertoireSide: "white",
      decision: "active",
      checkedAt: new Date().toISOString(),
      authorityVersion: "v1",
      expiresAt: new Date(Date.now() - 1).toISOString(),
    }),
    true,
  );
});
test("shared contracts keep flags off and detect solution fields", () => {
  assert.equal(
    Object.values(FEATURE_FLAGS).every((flag) => flag === false),
    true,
  );
  assert.equal(
    hasSolutionBearingFields({ prompt: "safe", expectedMoveUci: "e2e4" }),
    true,
  );
  assert.equal(
    hasSolutionBearingFields({ prompt: "safe", positionFen: "fen" }),
    false,
  );
});
