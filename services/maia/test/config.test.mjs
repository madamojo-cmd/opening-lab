import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readConfig } from "../src/config.mjs";

describe("service configuration", () => {
  it("requires a production-strength token", () => {
    assert.throws(() => readConfig({ MAIA_SERVICE_TOKEN: "short" }), {
      message: "MAIA_SERVICE_TOKEN_too_short",
    });
    const config = readConfig({
      MAIA_SERVICE_TOKEN: "x".repeat(32),
      PORT: "9000",
    });
    assert.equal(config.port, 9000);
    assert.equal(config.queueLimit, 32);
    assert.deepEqual(config.prewarmSkills, [
      "maia-1100",
      "maia-1500",
      "maia-1900",
    ]);
  });

  it("bounds capacity configuration", () => {
    assert.throws(
      () =>
        readConfig({
          MAIA_SERVICE_TOKEN: "x".repeat(32),
          MAIA_QUEUE_LIMIT: "999",
        }),
      { message: "MAIA_QUEUE_LIMIT_invalid" },
    );
  });

  it("requires the health skill in a bounded valid prewarm set", () => {
    assert.throws(
      () =>
        readConfig({
          MAIA_SERVICE_TOKEN: "x".repeat(32),
          MAIA_MAX_WARM_WORKERS: "1",
        }),
      { message: "MAIA_PREWARM_SKILLS_invalid" },
    );
    assert.throws(
      () =>
        readConfig({
          MAIA_SERVICE_TOKEN: "x".repeat(32),
          MAIA_PREWARM_SKILLS: "maia-1100,maia-1900",
        }),
      { message: "MAIA_PREWARM_SKILLS_invalid" },
    );
  });
});
