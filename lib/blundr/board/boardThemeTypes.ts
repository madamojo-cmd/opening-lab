export const BLUNDR_BOARD_THEME_IDS = ["default", "blue", "walnut"] as const;

export type BlundrBoardThemeId = (typeof BLUNDR_BOARD_THEME_IDS)[number];
export type BlundrBoardThemeInputId = BlundrBoardThemeId | "classic" | "slate" | "" | null | undefined;
export type BlundrBoardPieceSetId = "unicode" | "neo" | "letters";
export type BlundrBoardOrientation = "white" | "black" | "auto";
export type BlundrBoardPreferenceSource = "default" | "local_demo" | "authenticated";

export type BlundrBoardPreferences = {
  boardThemeId: BlundrBoardThemeId;
  pieceSetId: BlundrBoardPieceSetId;
  showCoordinates: boolean;
  boardOrientation: BlundrBoardOrientation;
  source: BlundrBoardPreferenceSource;
  updatedAt: string;
};

export const BLUNDR_BOARD_THEME_ALIASES: Record<string, BlundrBoardThemeId> = {
  default: "default",
  classic: "default",
  slate: "default",
  blue: "blue",
  walnut: "walnut",
};

export function normalizeBoardThemeId(value: unknown): BlundrBoardThemeId {
  const text = String(value ?? "").trim().toLowerCase();
  return BLUNDR_BOARD_THEME_IDS.includes(text as BlundrBoardThemeId) ? (text as BlundrBoardThemeId) : BLUNDR_BOARD_THEME_ALIASES[text] ?? "default";
}

export function normalizeBoardPieceSetId(value: unknown): BlundrBoardPieceSetId {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "neo" || text === "letters" ? text : "unicode";
}

export function normalizeBoardOrientation(value: unknown): BlundrBoardOrientation {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "white" || text === "black" || text === "auto" ? text : "auto";
}

export function normalizeBoardPreferenceSource(value: unknown): BlundrBoardPreferenceSource {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "local_demo" || text === "authenticated" ? text : "default";
}

export function createDefaultBoardPreferences(now = new Date().toISOString()): BlundrBoardPreferences {
  return {
    boardThemeId: "default",
    pieceSetId: "unicode",
    showCoordinates: true,
    boardOrientation: "auto",
    source: "default",
    updatedAt: now,
  };
}
