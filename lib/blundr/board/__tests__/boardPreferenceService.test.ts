import assert from "node:assert/strict";

import {
  areBoardPreferencesEquivalent,
  createDefaultBoardPreferences,
  normalizeBoardPreferences,
  readLocalBoardPreferences,
  writeLocalBoardPreferences,
} from "../boardPreferenceService.ts";
import { buildBoardRenderConfig, resolveBoardOrientation } from "../boardRenderConfig.ts";

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

const previousWindow = (globalThis as any).window;
let dispatchCount = 0;
(globalThis as any).window = {
  dispatchEvent: () => {
    dispatchCount += 1;
    return true;
  },
};

try {
  const initialPreferences = {
    boardThemeId: "blue",
    pieceSetId: "neo",
    showCoordinates: true,
    boardOrientation: "white",
    source: "local_demo",
    updatedAt: "2026-07-06T12:30:00.000Z",
  } as const;

  const written = writeLocalBoardPreferences(initialPreferences, storage);
  assert.equal(written.boardThemeId, "blue");
  assert.equal(dispatchCount, 1);
  assert.equal(storage.getItem("blundr-board-settings")?.includes('"boardTheme":"blue"'), true);

  const reread = readLocalBoardPreferences(storage);
  assert.equal(reread.boardThemeId, "blue");
  assert.equal(reread.pieceSetId, "neo");
  assert.equal(reread.boardOrientation, "white");
  assert.equal(reread.source, "local_demo");
  assert.equal(
    areBoardPreferencesEquivalent(
      reread,
      {
        ...reread,
        updatedAt: "2026-07-06T12:35:00.000Z",
      },
    ),
    true,
  );

  const equivalentWrite = writeLocalBoardPreferences(
    {
      ...reread,
      updatedAt: "2026-07-06T12:45:00.000Z",
    },
    storage,
  );
  assert.equal(dispatchCount, 1);
  assert.equal(equivalentWrite.updatedAt, reread.updatedAt);

  const changedWrite = writeLocalBoardPreferences(
    {
      ...reread,
      pieceSetId: "unicode",
      updatedAt: "2026-07-06T12:50:00.000Z",
    },
    storage,
  );
  assert.equal(dispatchCount, 2);
  assert.equal(changedWrite.pieceSetId, "unicode");
  assert.equal(readLocalBoardPreferences(storage).pieceSetId, "unicode");

  assert.equal(
    resolveBoardOrientation({
      boardOrientation: "black",
      openingColor: "white",
      fenTurn: "white",
    }),
    "black",
  );
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
} finally {
  if (typeof previousWindow === "undefined") {
    delete (globalThis as any).window;
  } else {
    (globalThis as any).window = previousWindow;
  }
}

console.log("boardPreferenceService.test.ts passed");
