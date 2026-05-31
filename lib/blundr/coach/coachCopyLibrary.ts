import type { CoachCopyEntry, CoachMode } from "./coachTypes";

function e(input: CoachCopyEntry): CoachCopyEntry {
  return input;
}

export const COACH_COPY_LIBRARY: CoachCopyEntry[] = [
  e({ utteranceId: "dwp_a1", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "The bishop develops and pressures f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_a2", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "White develops while creating a concrete target on f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["development", "target", "f7"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_p1", utteranceFamily: "dwp_prompt", conceptId: "develop_with_pressure", text: "Look for a developing move that creates pressure.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_hs1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "Think about which move develops while creating pressure.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_hg1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "The key target is f7, and a bishop can pressure it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["f7", "bishop", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_ans1", utteranceFamily: "dwp_answer", conceptId: "develop_with_pressure", text: "Play Bc4. The bishop develops and pressures f7.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
  e({ utteranceId: "dwp_r1", utteranceFamily: "dwp_reinforce", conceptId: "develop_with_pressure", text: "Good. You developed with pressure, not just development.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dwp_w1", utteranceFamily: "dwp_why", conceptId: "develop_with_pressure", text: "Good opening moves often develop a piece while creating a concrete target.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["development", "target"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),

  e({ utteranceId: "cfs_a1", utteranceFamily: "castle_assist", conceptId: "castle_for_safety", text: "The king moves to safety before the center opens.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "cfs_p1", utteranceFamily: "castle_prompt", conceptId: "castle_for_safety", text: "Ask whether the king should stay in the center much longer.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["king", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "cfs_h1", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "Think about king safety before the center opens.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "cfs_h2", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "This is the moment to move the king to safety.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "cfs_ans1", utteranceFamily: "castle_answer", conceptId: "castle_for_safety", text: "Castle kingside. The king moves to safety before the center opens.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
  e({ utteranceId: "cfs_r1", utteranceFamily: "castle_reinforce", conceptId: "castle_for_safety", text: "Good. The king is safer before the center opens.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "cfs_w1", utteranceFamily: "castle_why", conceptId: "castle_for_safety", text: "Castling moves the king away from the center and connects the rook.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["king", "center", "rook"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),

  e({ utteranceId: "pcb_a1", utteranceFamily: "c3_assist", conceptId: "prepare_center_break", text: "c3 supports a later d4 break and helps White build the center.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["pawn", "d4", "center", "pawn break"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "pcb_p1", utteranceFamily: "c3_prompt", conceptId: "prepare_center_break", text: "Look for White’s quiet center-building move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "pcb_h1", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "Think about preparing d4 before playing it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["d4", "pawn break"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "pcb_h2", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "The c-pawn can help White prepare d4.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "d4"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "pcb_ans1", utteranceFamily: "c3_answer", conceptId: "prepare_center_break", text: "Play c3. It supports a later d4 break.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["pawn", "d4", "pawn break"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),

  e({ utteranceId: "rtc_a1", utteranceFamily: "re1_assist", conceptId: "rook_to_center", text: "The rook moves toward the center so it can support White’s central plan.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "rtc_p1", utteranceFamily: "re1_prompt", conceptId: "rook_to_center", text: "Look for a quiet move that improves central support.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center", "central plan"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "rtc_h1", utteranceFamily: "re1_hint", conceptId: "rook_to_center", text: "The rook can move onto the e-file to support the center.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["rook", "e-file", "center"], claimTypes: ["plan_principle"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "rtc_ans1", utteranceFamily: "re1_answer", conceptId: "rook_to_center", text: "Play Re1. The rook moves toward the center so it can support White’s central plan.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),

  e({ utteranceId: "ct_a1", utteranceFamily: "center_assist", conceptId: "center_tension", text: "The fight in the center decides which pieces become active.", allowedModes: ["assisted_teach", "freeplay_principle"], requiredConcreteObjects: ["center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "ct_p1", utteranceFamily: "center_prompt", conceptId: "center_tension", text: "Study the center before choosing a move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "ct_h1", utteranceFamily: "center_hint", conceptId: "center_tension", text: "Look at how the central pawns affect piece activity.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),

  e({ utteranceId: "ks_p1", utteranceFamily: "ks", conceptId: "king_safety", text: "Before the center opens, the king’s safety matters more than grabbing space.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "dev_p1", utteranceFamily: "dev", conceptId: "development", text: "Improve the piece that has not joined the game yet.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["development", "least active piece"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
  e({ utteranceId: "ofr_p1", utteranceFamily: "open_file", conceptId: "open_file_rook", text: "A rook becomes more useful when it supports an open or central file.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["rook", "open file", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
];

const CONCEPT_ALIAS: Record<string, string> = {
  develops_with_pressure: "develop_with_pressure",
  development_with_pressure: "develop_with_pressure",
  development_with_f7_pressure: "develop_with_pressure",
  develop_and_control: "development",
  pawn_break: "prepare_center_break",
  rook_activity: "rook_to_center",
  center_control: "center_tension",
};

export function normalizeConceptId(conceptId?: string): string {
  if (!conceptId) return "center_tension";
  const key = conceptId.toLowerCase();
  return CONCEPT_ALIAS[key] ?? key;
}

export function getCoachCopyEntries(conceptId: string, mode: CoachMode): CoachCopyEntry[] {
  const normalized = normalizeConceptId(conceptId);
  const exact = COACH_COPY_LIBRARY.filter((entry) => entry.conceptId === normalized && entry.allowedModes.includes(mode));
  if (exact.length) return exact;
  const fallbackByMode = COACH_COPY_LIBRARY.filter((entry) => entry.conceptId === "center_tension" && entry.allowedModes.includes(mode));
  return fallbackByMode;
}
