import assert from "node:assert/strict";

import {
  renderBoardPieceGlyph,
  resolveBoardPieceSizeStyle,
  resolveBoardPieceToneClasses,
  resolveBoardPieceTypographyClasses,
} from "../../board/boardPieceRendering";

assert.equal(renderBoardPieceGlyph("w", "k", "unicode"), "♔");
assert.equal(renderBoardPieceGlyph("b", "q", "unicode"), "♛");
assert.equal(renderBoardPieceGlyph("w", "k", "letters"), "K");
assert.equal(renderBoardPieceGlyph("b", "q", "letters"), "q");
assert.equal(renderBoardPieceGlyph("w", "k", "neo"), "♔");

assert.equal(resolveBoardPieceTypographyClasses("unicode"), "font-serif");
assert.equal(resolveBoardPieceTypographyClasses("letters"), "font-black font-sans");

assert.ok(resolveBoardPieceToneClasses("w").includes("text-stone-50"));
assert.ok(resolveBoardPieceToneClasses("b").includes("text-stone-950"));

assert.equal(resolveBoardPieceSizeStyle("unicode"), "min(10vw,42px)");
assert.equal(resolveBoardPieceSizeStyle("letters"), "min(8.5vw,36px)");

console.log("dailyBoardPieceConsistency.test.ts passed");
