export const BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT = "blundr-board-preferences-changed";

export type BlundrBoardPreferencesChangedDetail = {
  boardThemeId: string;
  pieceSetId: string;
  source: string;
  updatedAt: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function notifyBlundrBoardPreferencesChanged(detail: BlundrBoardPreferencesChangedDetail): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent<BlundrBoardPreferencesChangedDetail>(BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT, {
        detail: {
          boardThemeId: normalizeText(detail.boardThemeId),
          pieceSetId: normalizeText(detail.pieceSetId),
          source: normalizeText(detail.source),
          updatedAt: normalizeText(detail.updatedAt),
        },
      }),
    );
  } catch {
    // Preference refresh is a best-effort hint only.
  }
}
