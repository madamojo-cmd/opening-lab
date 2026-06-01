import assert from "node:assert/strict";

import { buildOpeningTree } from "../openingTree";
import type { RepertoireLineInput } from "../openingTypes";

export function testOpeningTree(): void {
  const lines: RepertoireLineInput[] = [
    { openingId: "qg", lineId: "qg:0", openingName: "Queen's Gambit", sideToTrain: "white", movesSan: ["d4", "d5", "c4"] },
    { openingId: "qg", lineId: "qg:1", openingName: "Queen's Gambit", sideToTrain: "white", movesSan: ["d4", "d5", "Nf3"] },
  ];
  const tree = buildOpeningTree(lines);
  assert.equal(tree.invalidSan.length, 0);
  assert.equal(tree.lineCount, 2);
  const start = tree.nodesByFen4["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"];
  assert.equal(start?.[0]?.continuations.some((move) => move.san === "d4"), true);
  const branchNodes = Object.values(tree.nodesByFen4).find((nodes) => {
    const sans = nodes.flatMap((node) => node.continuations.map((move) => move.san));
    return sans.includes("c4") && sans.includes("Nf3");
  });
  assert.equal(Boolean(branchNodes), true);
  const terminalNodes = Object.values(tree.nodesByFen4).flat().filter((node) => node.terminal);
  assert.equal(terminalNodes.length >= 2, true);
}
