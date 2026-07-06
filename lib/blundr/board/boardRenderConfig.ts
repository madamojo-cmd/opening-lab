import {
  normalizeBoardOrientation,
  normalizeBoardPieceSetId,
  normalizeBoardPreferenceSource,
  normalizeBoardThemeId,
  type BlundrBoardOrientation,
  type BlundrBoardPieceSetId,
  type BlundrBoardPreferenceSource,
  type BlundrBoardThemeId,
} from "./boardThemeTypes";
import { resolveBoardTheme, type BlundrBoardThemeConfig } from "./boardThemeConfig";

export type BlundrBoardRenderConfig = {
  boardThemeId: BlundrBoardThemeId;
  pieceSetId: BlundrBoardPieceSetId;
  showCoordinates: boolean;
  boardOrientation: BlundrBoardOrientation;
  source: BlundrBoardPreferenceSource;
  updatedAt: string;
  theme: BlundrBoardThemeConfig;
};

export function resolveBoardOrientation(input: {
  boardOrientation?: unknown;
  openingColor?: unknown;
  userColor?: unknown;
  fenTurn?: unknown;
}): Exclude<BlundrBoardOrientation, "auto"> {
  const explicit = normalizeBoardOrientation(input.boardOrientation);
  if (explicit === "white" || explicit === "black") return explicit;
  const openingColor = String(input.openingColor ?? "").trim().toLowerCase();
  if (openingColor === "white" || openingColor === "black") return openingColor;
  const userColor = String(input.userColor ?? "").trim().toLowerCase();
  if (userColor === "white" || userColor === "black") return userColor;
  const fenTurn = String(input.fenTurn ?? "").trim().toLowerCase();
  if (fenTurn === "white" || fenTurn === "black") return fenTurn;
  return "white";
}

export function buildBoardRenderConfig(input: {
  boardThemeId?: unknown;
  pieceSetId?: unknown;
  showCoordinates?: boolean;
  boardOrientation?: unknown;
  openingColor?: unknown;
  userColor?: unknown;
  fenTurn?: unknown;
  source?: unknown;
  updatedAt?: string;
}): BlundrBoardRenderConfig {
  const boardThemeId = normalizeBoardThemeId(input.boardThemeId);
  const pieceSetId = normalizeBoardPieceSetId(input.pieceSetId);
  const boardOrientation = resolveBoardOrientation({
    boardOrientation: input.boardOrientation,
    openingColor: input.openingColor,
    userColor: input.userColor,
    fenTurn: input.fenTurn,
  });
  const source = normalizeBoardPreferenceSource(input.source);
  const updatedAt = String(input.updatedAt ?? new Date().toISOString()).trim() || new Date().toISOString();
  const theme = resolveBoardTheme(boardThemeId);

  return {
    boardThemeId,
    pieceSetId,
    showCoordinates: Boolean(input.showCoordinates ?? true),
    boardOrientation,
    source,
    updatedAt,
    theme,
  };
}
