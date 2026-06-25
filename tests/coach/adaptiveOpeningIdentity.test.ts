import assert from "node:assert/strict";

import {
  resolveAdaptiveOpeningIdentity,
  type AdaptiveOpeningIdentity,
} from "../../lib/blundr/openings/adaptiveOpeningIdentity";
import {
  buildRuntimeOpeningIdentityLines,
  loadStage2RuntimeTrainableRepertoire,
} from "../../lib/blundr/openings/runtimeLineBodyLoader";

function mustResolve(identity: AdaptiveOpeningIdentity | null): AdaptiveOpeningIdentity {
  assert.ok(identity, "expected adaptive opening identity");
  return identity;
}

async function getRuntimeIdentityLines(openingId: string) {
  const repertoire = await loadStage2RuntimeTrainableRepertoire(openingId);
  assert.ok(repertoire, `expected runtime repertoire:${openingId}`);
  return buildRuntimeOpeningIdentityLines(repertoire);
}

void (async () => {
  {
    const identity = mustResolve(resolveAdaptiveOpeningIdentity({
      selectedOpeningId: "italian-white",
      selectedOpeningName: "Italian Game",
      moveHistoryUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
      runtimeIdentityLines: await getRuntimeIdentityLines("italian-white"),
    }));

    assert.equal(identity.currentOpeningId, "italian-white");
    assert.equal(identity.currentOpeningName, "Italian Game");
    assert.equal(identity.source, "runtime_play_key");
    assert.equal(identity.ply, 5);
    assert.equal(identity.transpositionDetected, false);
  }

  {
    const identity = mustResolve(resolveAdaptiveOpeningIdentity({
      selectedOpeningId: "italian-white",
      selectedOpeningName: "Italian Game",
      moveHistoryUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"],
      runtimeIdentityLines: await getRuntimeIdentityLines("italian-white"),
    }));

    assert.equal(identity.currentOpeningId, "italian-white");
    assert.equal(identity.openingFamilyName, "Italian Game");
    assert.equal(identity.opponentOpeningName, "Two Knights Defense");
    assert.match(identity.lichessOpeningName ?? "", /Two Knights Defense/);
  }

  {
    const identity = mustResolve(resolveAdaptiveOpeningIdentity({
      selectedOpeningId: "caro-kann-black",
      selectedOpeningName: "Caro-Kann Defense",
      moveHistoryUci: ["e2e4", "c7c6"],
      runtimeIdentityLines: await getRuntimeIdentityLines("caro-kann-black"),
    }));

    assert.equal(identity.currentOpeningId, "caro-kann-black");
    assert.equal(identity.currentOpeningName, "Caro-Kann Defense");
  }

  {
    const identity = mustResolve(resolveAdaptiveOpeningIdentity({
      selectedOpeningId: "queens-indian-black",
      selectedOpeningName: "Queen's Indian Defense",
      moveHistoryUci: ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6"],
      runtimeIdentityLines: await getRuntimeIdentityLines("queens-indian-black"),
    }));

    assert.equal(identity.currentOpeningId, "queens-indian-black");
    assert.equal(identity.currentOpeningName, "Queen's Indian Defense");
  }

  {
    const identity = resolveAdaptiveOpeningIdentity({
      selectedOpeningId: "italian-white",
      selectedOpeningName: "Italian Game",
      moveHistoryUci: ["a2a3", "h7h6", "a3a4"],
      runtimeIdentityLines: await getRuntimeIdentityLines("italian-white"),
    });

    assert.equal(identity, null);
  }

  {
    const lines = await getRuntimeIdentityLines("italian-white");
    assert.ok(lines.length > 0, "expected italian-white identity lines");
    assert.ok(lines.every((line) => line.openingId === "italian-white"));
    assert.ok(lines.every((line) => line.playSequenceUci.length > 0));
  }

  console.log("adaptiveOpeningIdentity ok");
})();
