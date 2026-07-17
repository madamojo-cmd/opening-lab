import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultRepertoireProgress,
  isOpeningUnlocked,
} from "@/lib/blundr/repertoire/repertoireUnlockService";
import { evaluateOpeningAccess } from "../openingAccessPolicy";
import { reprocessEligibleOnUnlock } from "../reprocessOnUnlock";
test("opening access fails closed for unknown, wrong-side, and locked openings", () => {
  const repertoire = createDefaultRepertoireProgress({
    userId: "user-a",
    starterPackId: "classical_attacker",
  });
  assert.equal(
    evaluateOpeningAccess({
      userId: "user-a",
      openingId: "not-real",
      repertoireSide: "white",
      repertoire,
    }).decision,
    "gated_pending",
  );
  assert.equal(
    evaluateOpeningAccess({
      userId: "user-a",
      openingId: "french-black",
      repertoireSide: "white",
      repertoire,
    }).decision,
    "gated_pending",
  );
  assert.equal(
    evaluateOpeningAccess({
      userId: "user-a",
      openingId: "london-white",
      repertoireSide: "white",
      repertoire,
    }).decision,
    "gated_pending",
  );
});
test("opening access scopes unlock reprocessing by side", () => {
  const repertoire = createDefaultRepertoireProgress({
    userId: "user-a",
    starterPackId: "classical_attacker",
  });
  const access = evaluateOpeningAccess({
    userId: "user-a",
    openingId: "italian-white",
    repertoireSide: "white",
    repertoire,
  });
  assert.equal(access.decision, "active");
  const event = {
    userId: "user-a",
    deletedAt: null,
    position: { openingId: "italian-white", repertoireSide: "white" },
  } as never;
  assert.equal(
    reprocessEligibleOnUnlock([event], "italian-white", "white", access).length,
    1,
  );
  assert.equal(
    reprocessEligibleOnUnlock([event], "italian-white", "black", access).length,
    0,
  );
});

test("opening access accepts canonical runtime identity for persisted aliases", () => {
  const repertoire = createDefaultRepertoireProgress({
    userId: "user-a",
    starterPackId: "solid_builder",
  });
  repertoire.unlockedOpeningIds = ["qg-white"];

  assert.equal(isOpeningUnlocked(repertoire, "queens-gambit-white"), true);
  assert.equal(
    evaluateOpeningAccess({
      userId: "user-a",
      openingId: "qg-white",
      repertoireSide: "white",
      repertoire,
    }).decision,
    "active",
  );
});
