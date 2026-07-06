import {
  createDefaultBoardPreferences,
  normalizeBoardOrientation,
  normalizeBoardPieceSetId,
  normalizeBoardPreferenceSource,
  normalizeBoardThemeId,
  type BlundrBoardPreferenceSource,
  type BlundrBoardPreferences,
  type BlundrBoardThemeInputId,
} from "./boardThemeTypes";

export { createDefaultBoardPreferences } from "./boardThemeTypes";

export const BLUNDR_BOARD_PREFERENCES_STORAGE_KEY = "blundr-board-settings";

type LegacyBoardSettingsLike = {
  boardTheme?: unknown;
  boardThemeId?: unknown;
  pieceStyle?: unknown;
  pieceSetId?: unknown;
  showCoordinates?: unknown;
  boardOrientation?: unknown;
  playerColor?: unknown;
  source?: unknown;
  updatedAt?: unknown;
};

function nowIso(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizeBoardPreferences(value: unknown, fallback = createDefaultBoardPreferences()): BlundrBoardPreferences {
  const record = isRecord(value) ? (value as LegacyBoardSettingsLike) : {};
  const boardThemeId = normalizeBoardThemeId(record.boardThemeId ?? record.boardTheme ?? fallback.boardThemeId);
  const pieceSetId = normalizeBoardPieceSetId(record.pieceSetId ?? record.pieceStyle ?? fallback.pieceSetId);
  const showCoordinates = typeof record.showCoordinates === "boolean" ? record.showCoordinates : fallback.showCoordinates;
  const boardOrientation = normalizeBoardOrientation(record.boardOrientation ?? record.playerColor ?? fallback.boardOrientation);
  const source = normalizeBoardPreferenceSource(record.source ?? fallback.source);
  const updatedAt = typeof record.updatedAt === "string" && record.updatedAt.trim().length > 0 ? record.updatedAt.trim() : fallback.updatedAt || nowIso();

  return {
    boardThemeId,
    pieceSetId,
    showCoordinates,
    boardOrientation,
    source,
    updatedAt,
  };
}

export function resolveBoardPreferences(value: unknown, fallback = createDefaultBoardPreferences()): BlundrBoardPreferences {
  return normalizeBoardPreferences(value, fallback);
}

export function readLocalBoardPreferences(storage?: Storage | null): BlundrBoardPreferences {
  if (!storage) {
    return createDefaultBoardPreferences();
  }

  const raw = storage.getItem(BLUNDR_BOARD_PREFERENCES_STORAGE_KEY);
  if (!raw) {
    return createDefaultBoardPreferences();
  }

  try {
    return normalizeBoardPreferences(JSON.parse(raw), {
      ...createDefaultBoardPreferences(),
      source: "local_demo",
    });
  } catch {
    return createDefaultBoardPreferences();
  }
}

export function writeLocalBoardPreferences(preferences: BlundrBoardPreferences, storage?: Storage | null): BlundrBoardPreferences {
  if (!storage) {
    return preferences;
  }

  const payload: LegacyBoardSettingsLike & BlundrBoardPreferences = {
    boardThemeId: preferences.boardThemeId,
    boardTheme: preferences.boardThemeId,
    pieceSetId: preferences.pieceSetId,
    pieceStyle: preferences.pieceSetId,
    showCoordinates: preferences.showCoordinates,
    boardOrientation: preferences.boardOrientation,
    playerColor: preferences.boardOrientation,
    source: preferences.source,
    updatedAt: preferences.updatedAt,
  };

  try {
    storage.setItem(BLUNDR_BOARD_PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Local board preferences are optional.
  }

  return preferences;
}

export function createLocalBoardPreferences(
  input: Partial<BlundrBoardPreferences> & { source?: BlundrBoardPreferenceSource; updatedAt?: string } = {},
): BlundrBoardPreferences {
  return normalizeBoardPreferences(input, {
    ...createDefaultBoardPreferences(input.updatedAt ?? nowIso()),
    ...input,
    source: input.source ?? "local_demo",
  });
}
