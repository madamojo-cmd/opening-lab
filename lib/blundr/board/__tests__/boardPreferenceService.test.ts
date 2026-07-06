import assert from "node:assert/strict";

import {
  createDefaultBoardPreferences,
  normalizeBoardPreferences,
  readLocalBoardPreferences,
  writeLocalBoardPreferences,
} from "../boardPreferenceService";
import { buildBoardRenderConfig, resolveBoardOrientation } from "../boardRenderConfig";

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.entries.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

const storage = new MemoryStorage();

const normalized = normalizeBoardPreferences(
  {
    boardTheme: "slate",
    pieceStyle: "letters",
    showCoordinates: false,
    boardOrientation: "black",
    source: "authenticated",
    updatedAt: "2026-07-06T12:00:00.000Z",
  },
  createDefaultBoardPreferences("2026-07-06T00:00:00.000Z"),
);

assert.equal(normalized.boardThemeId, "default");
assert.equal(normalized.pieceSetId, "letters");
assert.equal(normalized.showCoordinates, false);
assert.equal(normalized.boardOrientation, "black");
assert.equal(normalized.source, "authenticated");

const written = writeLocalBoardPreferences(
  {
    boardThemeId: "blue",
    pieceSetId: "neo",
    showCoordinates: true,
    boardOrientation: "white",
    source: "local_demo",
    updatedAt: "2026-07-06T12:30:00.000Z",
  },
  storage,
);

assert.equal(written.boardThemeId, "blue");
assert.equal(storage.getItem("blundr-board-settings")?.includes('"boardTheme":"blue"'), true);

const reread = readLocalBoardPreferences(storage);
assert.equal(reread.boardThemeId, "blue");
assert.equal(reread.pieceSetId, "neo");
assert.equal(reread.boardOrientation, "white");
assert.equal(reread.source, "local_demo");

assert.equal(resolveBoardOrientation({ boardOrientation: "black", openingColor: "white", fenTurn: "white" }), "black");
assert.equal(resolveBoardOrientation({ openingColor: "black", fenTurn: "white" }), "black");
assert.equal(resolveBoardOrientation({ fenTurn: "black" }), "black");

const config = buildBoardRenderConfig({
  boardThemeId: reread.boardThemeId,
  pieceSetId: reread.pieceSetId,
  showCoordinates: reread.showCoordinates,
  boardOrientation: reread.boardOrientation,
  source: reread.source,
  updatedAt: reread.updatedAt,
});

assert.equal(config.theme.squareDarkClassName, "bg-sky-700");
assert.equal(config.theme.squareLightClassName, "bg-sky-100");
assert.equal(config.theme.coordinateToneClassName, "text-sky-800");
assert.equal(config.boardOrientation, "white");
assert.equal(config.pieceSetId, "neo");

console.log("boardPreferenceService.test.ts passed");
