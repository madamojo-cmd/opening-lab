import assert from "node:assert/strict";

export function assertNoRawLabels(text: string): void {
  assert.equal(/Stockfish|verified_top2|rule-only visual|GPT manual|Maia probability|centipawn|top two/i.test(text), false);
}

export function assertNoPlainLeak(text: string, moveSan: string): void {
  assert.equal(text.includes(moveSan), false);
}

export function assertSentenceCap(text: string, max = 2): void {
  assert.equal(text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length <= max, true);
}
