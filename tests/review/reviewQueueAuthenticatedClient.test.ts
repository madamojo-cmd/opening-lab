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
});
