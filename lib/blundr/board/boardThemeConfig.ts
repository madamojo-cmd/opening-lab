import {
  normalizeBoardThemeId,
  type BlundrBoardThemeId,
} from "./boardThemeTypes";

export type BlundrBoardThemeConfig = {
  themeId: BlundrBoardThemeId;
  squareDarkClassName: string;
  squareLightClassName: string;
  coordinateToneClassName: string;
  surfaceClassName: string;
  surfaceRingClassName: string;
};

export const BLUNDR_BOARD_THEME_CONFIGS: Record<BlundrBoardThemeId, BlundrBoardThemeConfig> = {
  default: {
    themeId: "default",
    squareDarkClassName: "bg-[#779954]",
    squareLightClassName: "bg-[#edeed1]",
    coordinateToneClassName: "text-stone-600",
    surfaceClassName: "bg-white",
    surfaceRingClassName: "ring-stone-200",
  },
  blue: {
    themeId: "blue",
    squareDarkClassName: "bg-sky-700",
    squareLightClassName: "bg-sky-100",
    coordinateToneClassName: "text-sky-800",
    surfaceClassName: "bg-white",
    surfaceRingClassName: "ring-sky-200",
  },
  walnut: {
    themeId: "walnut",
    squareDarkClassName: "bg-amber-800",
    squareLightClassName: "bg-amber-100",
    coordinateToneClassName: "text-amber-800",
    surfaceClassName: "bg-white",
    surfaceRingClassName: "ring-amber-200",
  },
};

export function resolveBoardTheme(themeId: unknown): BlundrBoardThemeConfig {
  return BLUNDR_BOARD_THEME_CONFIGS[normalizeBoardThemeId(themeId)];
}
