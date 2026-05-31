import assert from "node:assert/strict";

import { approxTokenCount, sentenceCount } from "../chessLanguageLibrary";

export function testChessLanguageLibrary(): void {
  assert.equal(sentenceCount("One. Two."), 2);
  assert.equal(approxTokenCount("The bishop develops."), 3);
}
