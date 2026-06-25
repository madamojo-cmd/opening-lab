import assert from "node:assert/strict";

import { LICHESS_OPENING_IDENTITY_MANIFEST_COUNT } from "../../lib/blundr/openings/lichessOpeningIdentity.generated";
import { resolveLichessOpeningIdentity } from "../../lib/blundr/openings/lichessOpeningIdentity";

assert.ok(LICHESS_OPENING_IDENTITY_MANIFEST_COUNT >= 3000, "expected full lichess opening identity manifest");

{
  const identity = resolveLichessOpeningIdentity({
    moveHistoryUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"],
  });

  assert.ok(identity, "expected Italian Two Knights identity");
  assert.equal(identity.familyName, "Italian Game");
  assert.match(identity.name, /Two Knights Defense/);
}

{
  const identity = resolveLichessOpeningIdentity({
    moveHistoryUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"],
  });

  assert.ok(identity, "expected Italian Giuoco Piano identity");
  assert.equal(identity.familyName, "Italian Game");
  assert.match(identity.name, /Giuoco Piano/);
}

{
  const identity = resolveLichessOpeningIdentity({
    moveHistoryUci: ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6"],
  });

  assert.ok(identity, "expected Queen's Indian identity");
  assert.match(identity.name, /Queen's Indian Defense/);
}

{
  const identity = resolveLichessOpeningIdentity({
    moveHistoryUci: ["a2a3", "h7h6", "a3a4"],
  });

  assert.equal(identity, null);
}

console.log("lichessOpeningIdentity ok");
