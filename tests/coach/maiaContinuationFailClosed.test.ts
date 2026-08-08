import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const trainer = readFileSync("app/page.tsx", "utf8");

assert.match(trainer, /maia_continuation_unavailable/);
assert.match(trainer, /No substitute opponent move was played/);
assert.doesNotMatch(
  trainer,
  /source\s*=\s*[`"]Emergency legal fallback|source:\s*[`"]Emergency legal fallback/,
);
assert.doesNotMatch(trainer, /selectContinuedPlayMove/);

console.log("maiaContinuationFailClosed ok");
