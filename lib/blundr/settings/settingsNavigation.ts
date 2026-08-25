export type BlundrSettingsSectionId =
  | "account"
  | "training_preferences"
  | "daily_goals"
  | "visual_teaching_aids"
  | "billing"
  | "privacy"
  | "account_management";

export type BlundrMajorAppLink = {
  id: "home" | "daily" | "repertoire" | "progress" | "review";
  label: string;
  href: string;
  description: string;
};

export type BlundrBoardThemeOption = {
  id: "default" | "blue" | "walnut";
  label: string;
  description: string;
};

export type BlundrBoardPieceSetOption = {
  id: "unicode" | "neo" | "letters";
  label: string;
  description: string;
};

export const BLUNDR_MAJOR_APP_LINKS: readonly BlundrMajorAppLink[] = [
  { id: "home", label: "Home", href: "/", description: "Today’s Blundr dashboard." },
  { id: "daily", label: "Daily Blundr", href: "/daily", description: "Today’s review loop." },
  { id: "repertoire", label: "Repertoire", href: "/repertoire", description: "Unlock and train openings." },
  { id: "progress", label: "Progress", href: "/progress", description: "See training momentum and weak areas." },
  { id: "review", label: "Review", href: "/review", description: "Practice mistakes and minigames." },
] as const;

export const BLUNDR_SETTINGS_BOARD_THEME_OPTIONS: readonly BlundrBoardThemeOption[] = [
  { id: "default", label: "Default", description: "Classic green board colors." },
  { id: "blue", label: "Blue", description: "Cool blue board theme." },
  { id: "walnut", label: "Walnut", description: "Warm walnut board theme." },
] as const;

export const BLUNDR_SETTINGS_BOARD_PIECE_OPTIONS: readonly BlundrBoardPieceSetOption[] = [
  { id: "unicode", label: "Unicode", description: "Classic Unicode chess pieces." },
  { id: "neo", label: "Neo", description: "Clean simplified chess glyphs." },
  { id: "letters", label: "Letters", description: "Text-first piece labels." },
] as const;

export const BLUNDR_SETTINGS_SECTION_IDS: readonly BlundrSettingsSectionId[] = [
  "account",
  "training_preferences",
  "daily_goals",
  "visual_teaching_aids",
  "billing",
  "privacy",
  "account_management",
] as const;
