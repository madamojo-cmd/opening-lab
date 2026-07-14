import { describe, expect, it } from "vitest";
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

describe("shared contracts", () => {
  it("creates stable identities while separating route context from canonical position mastery", () => {
    const a = createPositionIdentity({ canonicalFen: "fen", openingId: "italian-white", repertoireSide: "white", expectedMoveUci: "e2e4", moveOrderKey: "a" });
    const b = createPositionIdentity({ canonicalFen: "fen", openingId: "italian-white", repertoireSide: "white", expectedMoveUci: "g1f3", moveOrderKey: "b" });
    expect(a.positionKey).toBe(b.positionKey);
    expect(a.moveOrderKey).not.toBe(b.moveOrderKey);
    expect(createDeterministicIdentity("event", ["a", 1])).toBe(createDeterministicIdentity("event", ["a", 1]));
  });

  it("round trips and rejects unsupported contract versions", () => {
    const value = { schemaVersion: BLUNDR_CONTRACT_VERSION, value: "ok" };
    expect(parseVersionedContract(serializeContract(value))).toEqual(value);
    expect(() => parseVersionedContract(JSON.stringify({ ...value, schemaVersion: "old" }))).toThrow("unsupported_contract_version");
  });

  it("fails closed for missing, stale, and non-active access", () => {
    expect(isFailClosedAccess(null)).toBe(true);
    expect(isFailClosedAccess({ openingId: "x", repertoireSide: "white", decision: "unknown", checkedAt: new Date().toISOString(), authorityVersion: "v1", expiresAt: null })).toBe(true);
    expect(isFailClosedAccess({ openingId: "x", repertoireSide: "white", decision: "active", checkedAt: new Date().toISOString(), authorityVersion: "v1", expiresAt: new Date(Date.now() - 1).toISOString() })).toBe(true);
  });

  it("keeps all new flags off and detects solution-bearing payloads", () => {
    expect(Object.values(FEATURE_FLAGS).every((flag) => flag === false)).toBe(true);
    expect(hasSolutionBearingFields({ prompt: "safe", expectedMoveUci: "e2e4" })).toBe(true);
    expect(hasSolutionBearingFields({ prompt: "safe", positionFen: "fen" })).toBe(false);
  });
});
