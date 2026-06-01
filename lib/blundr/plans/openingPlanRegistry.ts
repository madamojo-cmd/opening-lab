import type { OpeningPlanRegistryEntry } from "./planTypes";

export const OPENING_PLAN_REGISTRY_VERSION = "2.7.39";

export const OPENING_PLAN_REGISTRY: OpeningPlanRegistryEntry[] = [
  {
    openingId: "italian",
    conceptId: "develop_with_pressure",
    planType: "bishop_diagonal_pressure",
    movePatterns: ["f1c4", "Bc4"],
    requiredFeatureClaimTypes: ["active_bishop"],
    optionalFeatureClaimTypes: ["undeveloped_piece"],
    preferredTemplateCategories: ["bishop_activity", "development"],
  },
  {
    openingId: "italian",
    conceptId: "castle_for_safety",
    planType: "castle_and_connect_rooks",
    movePatterns: ["e1g1", "e8g8", "e1c1", "e8c8", "O-O", "O-O-O", "0-0", "0-0-0"],
    requiredFeatureClaimTypes: ["king_safety_urgent", "undeveloped_piece"],
    optionalFeatureClaimTypes: ["center_tension"],
    preferredTemplateCategories: ["castling", "king_safety"],
  },
  {
    openingId: "italian",
    conceptId: "prepare_center_break",
    planType: "central_break_preparation",
    movePatterns: ["c2c3", "c3", "d2d3", "d3"],
    requiredFeatureClaimTypes: ["pawn_lever_support"],
    optionalFeatureClaimTypes: ["center_tension"],
    preferredTemplateCategories: ["center_break", "italian_c3_d4"],
  },
  {
    openingId: "italian",
    conceptId: "rook_to_center",
    planType: "rook_centralization",
    movePatterns: ["f1e1", "a1e1", "Re1", "Rd1"],
    requiredFeatureClaimTypes: ["rook_on_open_file", "rook_on_semi_open_file"],
    optionalFeatureClaimTypes: ["center_tension"],
    preferredTemplateCategories: ["rook_activity"],
  },
  {
    openingId: "italian",
    conceptId: "center_tension",
    planType: "maintain_center_tension",
    movePatterns: [],
    requiredFeatureClaimTypes: ["center_tension"],
    optionalFeatureClaimTypes: ["development_lead"],
    preferredTemplateCategories: ["center_control"],
  },
];

export function findRegistryEntries(input: { openingId?: string; conceptId?: string; moveUci?: string; moveSan?: string }): OpeningPlanRegistryEntry[] {
  return OPENING_PLAN_REGISTRY.filter((entry) => {
    if (input.openingId && entry.openingId !== input.openingId) return false;
    if (input.conceptId && entry.conceptId !== input.conceptId) return false;
    const move = input.moveUci ?? input.moveSan;
    if (!move || !entry.movePatterns.length) return true;
    return entry.movePatterns.includes(move);
  });
}
