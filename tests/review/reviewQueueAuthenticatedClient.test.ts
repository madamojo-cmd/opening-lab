import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("Review Queue browser clients send authenticated API requests", () => {
  const inbox = read("components/review/ReviewQueueInbox.tsx");
  const replay = read("components/review/ReviewMistakeReplay.tsx");

  assert.match(inbox, /authenticatedApiFetch/);
  assert.doesNotMatch(inbox, /fetch\(`\/api\/blundr\/review-queue/);

  assert.match(replay, /authenticatedApiFetch/);
  assert.doesNotMatch(
    replay,
    /fetch\(`\/api\/blundr\/review-mistakes/,
  );
  assert.doesNotMatch(
    replay,
    /fetch\("\/api\/blundr\/review-queue\?limit=1&page=0"/,
  );
  assert.match(inbox, /data-testid="review-queue-scroll-region"/);
  assert.match(inbox, /overflow-y-auto/);
  assert.match(replay, /import \{ Chess \} from "chess\.js"/);
  assert.match(replay, /const \[confirmedMoveUci, setConfirmedMoveUci\]/);
  assert.match(
    replay,
    /const demonstratedMoveUci = reveal\?\.expectedMoveUci \?\? confirmedMoveUci/,
  );
  assert.match(replay, /const demonstratedFen = useMemo/);
  assert.match(replay, /new Chess\(readySnapshot\.canonicalFen\)/);
  assert.match(replay, /fen=\{demonstratedFen\}/);
  assert.match(replay, /squareStyles=\{demonstratedSquareStyles\}/);
  assert.match(replay, /setConfirmedMoveUci\(uci\)/);
  assert.match(replay, /setConfirmedMoveUci\(null\)/);
  assert.match(replay, /Continue/);
  assert.match(replay, /attempt\?\.correct/);
  assert.match(replay, /router\.replace\(\s*next/);
});
