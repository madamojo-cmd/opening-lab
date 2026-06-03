import type { ConceptFamily, ConceptEloBand, TeachingConcept } from "./TeachingConcept";

const DEFAULT_ELO_BANDS: ConceptEloBand[] = ["beginner", "novice", "intermediate"];

const STRONG_TERMS = [
  "best",
  "strongest",
  "forced",
  "only move",
  "wins",
  "winning",
  "mate",
  "checkmate",
  "trap",
  "refutes",
  "blunder",
];

type ConceptSpec = {
  id: string;
  label: string;
  family: ConceptFamily;
  summary: string;
  claimTypes?: string[];
  minStrength?: "verified" | "probable";
  requiredPieceTypes?: string[];
  requiredMoveFlags?: string[];
  optionalClaimTypes?: string[];
  themeTags?: string[];
  forbiddenWithoutEvidence?: string[];
  leakRisk?: "none" | "low" | "medium" | "high";
  allowInPlainBeforeShowMore?: boolean;
  requiresBoardTruth?: boolean;
  requiresEngineEvidence?: boolean;
  overclaimRisk?: "low" | "medium" | "high";
  visualPreferences?: TeachingConcept["visualPreferences"];
  plainHintTemplate?: string;
  assistedTemplate?: string;
  showMoreTemplate?: string;
  assistedSlots?: string[];
  showMoreSlots?: string[];
};

const DEFAULT_CLAIM_TYPES_BY_FAMILY: Record<ConceptFamily, string[]> = {
  opening_principle: ["development", "center_control", "strategic_feature"],
  development: ["development", "piece_activity"],
  center: ["center_control", "pawn_break", "pressure"],
  king_safety: ["king_safety", "castling", "pressure"],
  tactics: ["tactical_motif", "capture", "check", "checkmate"],
  piece_activity: ["piece_activity", "pressure", "strategic_feature"],
  pawn_structure: ["pawn_break", "strategic_feature", "piece_activity"],
  space: ["piece_activity", "center_control", "strategic_feature"],
  initiative: ["strategic_feature", "pressure", "tactical_motif"],
  defense: ["strategic_feature", "king_safety", "safe_fallback"],
  endgame: ["strategic_feature", "piece_activity", "safe_fallback"],
  opening_specific: ["opening_plan", "development", "center_control", "pressure"],
  mistake_pattern: ["human_mistake", "safe_fallback", "strategic_feature"],
  continuation: ["candidate_comparison", "strategic_feature", "safe_fallback"],
  visual_pattern: ["strategic_feature", "pressure", "piece_activity"],
  safety_fallback: ["safe_fallback", "strategic_feature", "piece_activity"],
};

const OPENING_CONCEPT_IDS = new Set([
  "italian_bishop_c4_pressure",
  "italian_c3_d4_plan",
  "ruy_lopez_bishop_b5_pressure",
  "queens_gambit_c4_center_challenge",
  "sicilian_c5_center_challenge",
  "french_d5_center_challenge",
  "caro_kann_c6_d5_structure",
  "kings_indian_fianchetto_setup",
]);

const HIGH_LEAK_IDS = new Set([
  "continuation_candidate_locked",
  "no_candidate_before_continue",
  "show_more_reveal",
  "visual_target_alignment",
  "mismatch_blocked",
]);

const ENGINE_GATED_IDS = new Set([
  "mate_threat",
  "sacrifice_requires_proof",
  "tactic_blocked_insufficient_evidence",
  "mismatch_blocked",
]);

const STRONG_EVIDENCE_IDS = new Set([
  "mate_threat",
  "sacrifice_requires_proof",
  "tactic_blocked_insufficient_evidence",
  "hanging_piece_capture",
  "trapped_piece_warning",
  "greek_gift_pattern",
  "mismatch_blocked",
]);

const REQUIRED_CONCEPT_SPECS: ConceptSpec[] = [
  { id: "occupy_center", label: "Occupy Center", family: "opening_principle", summary: "Place central pawns or pieces to claim central influence.", claimTypes: ["center_control", "piece_activity"] },
  { id: "challenge_center", label: "Challenge Center", family: "opening_principle", summary: "Contest opposing central control with direct pressure.", claimTypes: ["center_control", "pressure", "pawn_break"] },
  { id: "support_center", label: "Support Center", family: "opening_principle", summary: "Reinforce central pawns and squares before expansion.", claimTypes: ["center_control", "strategic_feature"] },
  { id: "build_full_center", label: "Build Full Center", family: "opening_principle", summary: "Coordinate pawns to create a broad and stable center.", claimTypes: ["center_control", "pawn_break", "strategic_feature"] },
  { id: "avoid_premature_queen", label: "Avoid Premature Queen", family: "opening_principle", summary: "Delay early queen adventures unless tactical evidence supports them.", claimTypes: ["piece_activity", "strategic_feature"], overclaimRisk: "medium" },
  { id: "avoid_repeated_piece_move", label: "Avoid Repeated Piece Move", family: "opening_principle", summary: "Prefer bringing new pieces into play over repeating the same move.", claimTypes: ["development", "piece_activity"] },
  { id: "develop_before_attack", label: "Develop Before Attack", family: "opening_principle", summary: "Complete basic development before launching direct attacks.", claimTypes: ["development", "strategic_feature"] },
  { id: "castle_before_center_opens", label: "Castle Before Center Opens", family: "opening_principle", summary: "Secure king safety before central files become tactical.", claimTypes: ["king_safety", "castling", "center_control"] },
  { id: "connect_rooks", label: "Connect Rooks", family: "opening_principle", summary: "Coordinate heavy pieces by clearing the back rank.", claimTypes: ["piece_activity", "development"] },
  { id: "improve_worst_piece", label: "Improve Worst Piece", family: "opening_principle", summary: "Upgrade the least active piece to increase total coordination.", claimTypes: ["piece_activity", "strategic_feature"] },
  { id: "gain_tempo", label: "Gain Tempo", family: "opening_principle", summary: "Develop while creating pressure that asks the opponent a question.", claimTypes: ["development", "pressure"] },
  { id: "develop_with_threat", label: "Develop With Threat", family: "opening_principle", summary: "Choose developing moves that also introduce concrete pressure.", claimTypes: ["development", "pressure", "tactical_motif"] },
  { id: "opening_space_gain", label: "Opening Space Gain", family: "opening_principle", summary: "Use early pawn or piece advances to claim useful space.", claimTypes: ["piece_activity", "center_control", "strategic_feature"] },
  { id: "flexible_development", label: "Flexible Development", family: "opening_principle", summary: "Preserve options while placing pieces on useful squares.", claimTypes: ["development", "strategic_feature"] },
  { id: "complete_minor_piece_development", label: "Complete Minor Piece Development", family: "opening_principle", summary: "Finish developing both bishops and knights before deeper plans.", claimTypes: ["development"] },

  { id: "knight_development", label: "Knight Development", family: "development", summary: "Bring a knight from the back rank to an active square.", claimTypes: ["development"], requiredPieceTypes: ["knight"] },
  { id: "bishop_development", label: "Bishop Development", family: "development", summary: "Develop a bishop onto a useful diagonal.", claimTypes: ["development", "piece_activity"], requiredPieceTypes: ["bishop"] },
  { id: "rook_development", label: "Rook Development", family: "development", summary: "Activate a rook toward open or contested files.", claimTypes: ["piece_activity", "development"], requiredPieceTypes: ["rook"] },
  { id: "queen_development", label: "Queen Development", family: "development", summary: "Develop the queen when coordination and safety are sufficient.", claimTypes: ["piece_activity", "strategic_feature"], requiredPieceTypes: ["queen"], overclaimRisk: "medium" },
  { id: "natural_development_square", label: "Natural Development Square", family: "development", summary: "Place a piece on a square that improves coordination and central reach.", claimTypes: ["development", "piece_activity"] },
  { id: "active_piece_development", label: "Active Piece Development", family: "development", summary: "Develop while immediately increasing activity.", claimTypes: ["development", "piece_activity", "pressure"] },
  { id: "piece_coordination", label: "Piece Coordination", family: "development", summary: "Improve cooperation between pieces around shared squares.", claimTypes: ["piece_activity", "strategic_feature"] },
  { id: "piece_repositioning", label: "Piece Repositioning", family: "development", summary: "Relocate a piece to a square with stronger long-term impact.", claimTypes: ["piece_activity", "strategic_feature"] },
  { id: "bring_last_piece_in", label: "Bring Last Piece In", family: "development", summary: "Complete development by activating the final undeveloped piece.", claimTypes: ["development", "piece_activity"] },
  { id: "avoid_blocking_bishop", label: "Avoid Blocking Bishop", family: "development", summary: "Maintain bishop diagonals when choosing pawn structure.", claimTypes: ["piece_activity", "strategic_feature"], requiredPieceTypes: ["pawn"] },
  { id: "avoid_blocking_center_pawn", label: "Avoid Blocking Center Pawn", family: "development", summary: "Keep central pawn breaks available while developing.", claimTypes: ["center_control", "pawn_break", "strategic_feature"] },
  { id: "develop_toward_center", label: "Develop Toward Center", family: "development", summary: "Favor squares that increase central influence during development.", claimTypes: ["development", "center_control"] },
  { id: "recapture_with_development", label: "Recapture With Development", family: "development", summary: "Recapture while also improving activity and coordination.", claimTypes: ["capture", "development", "piece_activity"] },
  { id: "improve_piece_activity", label: "Improve Piece Activity", family: "development", summary: "Choose moves that increase a piece's useful influence.", claimTypes: ["piece_activity"] },
  { id: "prepare_rook_to_open_file", label: "Prepare Rook to Open File", family: "development", summary: "Coordinate rooks for file play before files open.", claimTypes: ["piece_activity", "pressure"], requiredPieceTypes: ["rook", "pawn"] },

  { id: "central_pawn_advance", label: "Central Pawn Advance", family: "center", summary: "Push a central pawn to claim key squares.", claimTypes: ["center_control", "pawn_break"], requiredPieceTypes: ["pawn"] },
  { id: "central_pawn_break", label: "Central Pawn Break", family: "center", summary: "Use a timed pawn break to challenge the center.", claimTypes: ["pawn_break", "center_control"], requiredPieceTypes: ["pawn"], overclaimRisk: "medium" },
  { id: "undermine_center", label: "Undermine Center", family: "center", summary: "Target the base of the opponent's center with pawn or piece pressure.", claimTypes: ["pressure", "center_control", "pawn_break"] },
  { id: "reinforce_center", label: "Reinforce Center", family: "center", summary: "Support central pawns and central squares with pieces.", claimTypes: ["center_control", "strategic_feature"] },
  { id: "attack_center", label: "Attack Center", family: "center", summary: "Direct tactical or strategic pressure toward central points.", claimTypes: ["center_control", "pressure", "tactical_motif"] },
  { id: "occupy_outpost", label: "Occupy Outpost", family: "center", summary: "Place a piece on a stable advanced square.", claimTypes: ["strategic_feature", "piece_activity", "center_control"] },
  { id: "central_tension", label: "Central Tension", family: "center", summary: "Maintain unresolved central contact for flexibility.", claimTypes: ["center_control", "strategic_feature"] },
  { id: "resolve_center_tension", label: "Resolve Center Tension", family: "center", summary: "Clarify central structure when timing favors simplification.", claimTypes: ["center_control", "pawn_break", "capture"] },
  { id: "maintain_center_tension", label: "Maintain Center Tension", family: "center", summary: "Keep central choices open to limit opponent plans.", claimTypes: ["center_control", "strategic_feature"] },
  { id: "flank_pressure_on_center", label: "Flank Pressure on Center", family: "center", summary: "Use flank development to influence central files and diagonals.", claimTypes: ["pressure", "center_control", "piece_activity"] },

  { id: "kingside_castling", label: "Kingside Castling", family: "king_safety", summary: "Castle short to improve king safety and rook activity.", claimTypes: ["castling", "king_safety"], requiredMoveFlags: ["isCastle"] },
  { id: "queenside_castling", label: "Queenside Castling", family: "king_safety", summary: "Castle long when queenside safety and timing are favorable.", claimTypes: ["castling", "king_safety"], requiredMoveFlags: ["isCastle"], overclaimRisk: "medium" },
  { id: "king_safety", label: "King Safety", family: "king_safety", summary: "Prioritize king shelter and reduce direct tactical exposure.", claimTypes: ["king_safety", "strategic_feature"] },
  { id: "luft", label: "Luft", family: "king_safety", summary: "Create escape space for the king to reduce back-rank danger.", claimTypes: ["king_safety", "strategic_feature"] },
  { id: "avoid_king_in_center", label: "Avoid King in Center", family: "king_safety", summary: "Move king toward safer shelter before central lines open.", claimTypes: ["king_safety", "center_control"] },
  { id: "defend_f7_f2", label: "Defend f7/f2", family: "king_safety", summary: "Reinforce vulnerable f7 or f2 squares against tactical motifs.", claimTypes: ["king_safety", "defense", "pressure"], optionalClaimTypes: ["pressure"] },
  { id: "pressure_f7_f2", label: "Pressure f7/f2", family: "king_safety", summary: "Apply pressure near f7/f2 when lines and support are present.", claimTypes: ["pressure", "piece_activity", "tactical_motif"], overclaimRisk: "medium" },
  { id: "open_file_against_king", label: "Open File Against King", family: "king_safety", summary: "Open lines toward the king only when evidence supports the attack.", claimTypes: ["pressure", "strategic_feature", "pawn_break"], overclaimRisk: "medium" },
  { id: "diagonal_pressure_on_king", label: "Diagonal Pressure on King", family: "king_safety", summary: "Use diagonals to pressure the king shelter.", claimTypes: ["pressure", "piece_activity", "tactical_motif"] },
  { id: "castle_rights_preservation", label: "Castle Rights Preservation", family: "king_safety", summary: "Avoid unnecessary king or rook movement that loses castling rights.", claimTypes: ["king_safety", "strategic_feature"] },

  { id: "fork", label: "Fork", family: "tactics", summary: "A single move attacks two targets at once.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "medium" },
  { id: "pin", label: "Pin", family: "tactics", summary: "Constrain a piece because moving it would expose a higher-value target.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "medium" },
  { id: "skewer", label: "Skewer", family: "tactics", summary: "Attack through a valuable front piece to a target behind it.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "medium" },
  { id: "discovered_attack", label: "Discovered Attack", family: "tactics", summary: "Uncover a line attack by moving an intervening piece.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "medium" },
  { id: "discovered_check", label: "Discovered Check", family: "tactics", summary: "Reveal a check by moving a blocking piece.", claimTypes: ["tactical_motif", "check"], minStrength: "verified", overclaimRisk: "high" },
  { id: "double_attack", label: "Double Attack", family: "tactics", summary: "Create two concrete threats from one move.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "medium" },
  { id: "remove_defender", label: "Remove Defender", family: "tactics", summary: "Eliminate a key defender to expose tactical weaknesses.", claimTypes: ["tactical_motif", "capture", "pressure"], overclaimRisk: "high" },
  { id: "overloaded_defender", label: "Overloaded Defender", family: "tactics", summary: "Exploit a defender that cannot protect all required targets.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high" },
  { id: "deflection", label: "Deflection", family: "tactics", summary: "Force a key piece away from a critical square.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high" },
  { id: "decoy", label: "Decoy", family: "tactics", summary: "Lure a piece to a vulnerable square.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high" },
  { id: "attraction", label: "Attraction", family: "tactics", summary: "Draw a target piece into tactical range.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high" },
  { id: "clearance", label: "Clearance", family: "tactics", summary: "Vacate a line or square for a stronger follow-up.", claimTypes: ["tactical_motif", "piece_activity"], overclaimRisk: "medium" },
  { id: "interference", label: "Interference", family: "tactics", summary: "Block communication between defending pieces.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high" },
  { id: "zwischenzug", label: "Zwischenzug", family: "tactics", summary: "Insert an intermediate move before expected recapture.", claimTypes: ["tactical_motif", "check", "capture"], overclaimRisk: "high" },
  { id: "desperado", label: "Desperado", family: "tactics", summary: "Use a doomed piece to maximize tactical return.", claimTypes: ["tactical_motif", "capture"], overclaimRisk: "high" },
  { id: "back_rank_pressure", label: "Back Rank Pressure", family: "tactics", summary: "Pressure king safety along the back rank.", claimTypes: ["pressure", "king_safety", "tactical_motif"], overclaimRisk: "medium" },
  { id: "mate_threat", label: "Mate Threat", family: "tactics", summary: "A concrete checkmating threat is forming.", claimTypes: ["check", "checkmate", "tactical_motif"], minStrength: "verified", requiresEngineEvidence: true, overclaimRisk: "high", forbiddenWithoutEvidence: ["mate", "checkmate", "forced", "only move"] },
  { id: "loose_piece_pressure", label: "Loose Piece Pressure", family: "tactics", summary: "Pressure against undefended or weakly defended pieces.", claimTypes: ["pressure", "tactical_motif"], overclaimRisk: "medium" },
  { id: "hanging_piece_capture", label: "Hanging Piece Capture", family: "tactics", summary: "Capture opportunity appears against a hanging piece.", claimTypes: ["capture", "tactical_motif"], minStrength: "verified", overclaimRisk: "high", forbiddenWithoutEvidence: ["wins", "winning"] },
  { id: "trapped_piece_warning", label: "Trapped Piece Warning", family: "tactics", summary: "A piece may become trapped if coordination fails.", claimTypes: ["tactical_motif", "pressure"], overclaimRisk: "high", forbiddenWithoutEvidence: ["trap"] },
  { id: "x_ray_attack", label: "X-Ray Attack", family: "tactics", summary: "Line piece pressure through intervening units.", claimTypes: ["pressure", "tactical_motif"], overclaimRisk: "high" },
  { id: "battery", label: "Battery", family: "tactics", summary: "Align line pieces to reinforce a shared target.", claimTypes: ["pressure", "piece_activity", "tactical_motif"], overclaimRisk: "medium" },
  { id: "greek_gift_pattern", label: "Greek Gift Pattern", family: "tactics", summary: "Bxh7/Bxh2 style sacrifice pattern requires concrete follow-up proof.", claimTypes: ["tactical_motif", "king_safety", "check"], minStrength: "verified", requiresEngineEvidence: true, overclaimRisk: "high", forbiddenWithoutEvidence: ["forced", "winning", "mate"] },
  { id: "sacrifice_requires_proof", label: "Sacrifice Requires Proof", family: "tactics", summary: "Sacrificial play requires explicit tactical evidence before endorsement.", claimTypes: ["tactical_motif", "candidate_comparison"], minStrength: "verified", requiresEngineEvidence: true, overclaimRisk: "high", forbiddenWithoutEvidence: ["best", "forced", "wins", "winning"] },
  { id: "tactic_blocked_insufficient_evidence", label: "Tactic Blocked: Insufficient Evidence", family: "tactics", summary: "Suppress strong tactical claims when evidence is incomplete.", claimTypes: ["tactical_motif", "safe_fallback"], minStrength: "probable", requiresEngineEvidence: true, overclaimRisk: "high", forbiddenWithoutEvidence: ["best", "forced", "only move", "mate", "trap", "refutes", "blunder"] },

  { id: "bishop_diagonal", label: "Bishop Diagonal", family: "piece_activity", summary: "Bishop activity increases along open diagonals.", claimTypes: ["piece_activity", "pressure"], requiredPieceTypes: ["bishop"] },
  { id: "long_diagonal_pressure", label: "Long Diagonal Pressure", family: "piece_activity", summary: "Long diagonal pressure can influence king safety and center control.", claimTypes: ["pressure", "piece_activity"], requiredPieceTypes: ["bishop", "queen"] },
  { id: "knight_outpost", label: "Knight Outpost", family: "piece_activity", summary: "A knight can occupy a stable advanced square.", claimTypes: ["strategic_feature", "piece_activity"], requiredPieceTypes: ["knight"] },
  { id: "knight_rim_warning", label: "Knight Rim Warning", family: "piece_activity", summary: "Knight on the rim may reduce central influence.", claimTypes: ["piece_activity", "strategic_feature"], requiredPieceTypes: ["knight"] },
  { id: "rook_open_file", label: "Rook Open File", family: "piece_activity", summary: "Rook activity rises on fully open files.", claimTypes: ["piece_activity", "pressure"], requiredPieceTypes: ["rook"] },
  { id: "rook_semi_open_file", label: "Rook Semi-Open File", family: "piece_activity", summary: "Semi-open files provide useful rook pressure lanes.", claimTypes: ["piece_activity", "pressure"], requiredPieceTypes: ["rook"] },
  { id: "rook_lift", label: "Rook Lift", family: "piece_activity", summary: "A rook lift can create lateral attacking potential.", claimTypes: ["piece_activity", "initiative", "pressure"], requiredPieceTypes: ["rook"], overclaimRisk: "medium" },
  { id: "queen_activity", label: "Queen Activity", family: "piece_activity", summary: "Queen placement should balance activity and safety.", claimTypes: ["piece_activity", "strategic_feature"], requiredPieceTypes: ["queen"], overclaimRisk: "medium" },
  { id: "piece_on_open_line", label: "Piece on Open Line", family: "piece_activity", summary: "Line pieces gain impact on open files and diagonals.", claimTypes: ["piece_activity", "pressure"] },
  { id: "improve_bad_bishop", label: "Improve Bad Bishop", family: "piece_activity", summary: "Reposition or restructure to improve a restricted bishop.", claimTypes: ["piece_activity", "strategic_feature"], requiredPieceTypes: ["bishop"] },
  { id: "trade_bad_piece", label: "Trade Bad Piece", family: "piece_activity", summary: "Exchanging a poorly placed piece can improve coordination.", claimTypes: ["strategic_feature", "capture"] },
  { id: "restrict_opponent_piece", label: "Restrict Opponent Piece", family: "piece_activity", summary: "Limit opponent activity by controlling key squares.", claimTypes: ["pressure", "strategic_feature"] },
  { id: "dominate_square", label: "Dominate Square", family: "piece_activity", summary: "Build repeated control over a strategically important square.", claimTypes: ["pressure", "center_control", "strategic_feature"] },
  { id: "weak_square_pressure", label: "Weak Square Pressure", family: "piece_activity", summary: "Pressure weak squares that cannot be easily defended by pawns.", claimTypes: ["pressure", "strategic_feature"] },
  { id: "outpost_blocked_until_proven", label: "Outpost Blocked Until Proven", family: "piece_activity", summary: "Do not claim an outpost unless stability evidence is present.", claimTypes: ["strategic_feature", "safe_fallback"], minStrength: "probable", overclaimRisk: "high" },

  { id: "pawn_break", label: "Pawn Break", family: "pawn_structure", summary: "Timed pawn breaks open lines and challenge structure.", claimTypes: ["pawn_break", "center_control"], requiredPieceTypes: ["pawn"] },
  { id: "passed_pawn", label: "Passed Pawn", family: "pawn_structure", summary: "Passed pawn potential can shape strategic priorities.", claimTypes: ["strategic_feature", "piece_activity"], requiredPieceTypes: ["pawn"], overclaimRisk: "medium" },
  { id: "isolated_pawn", label: "Isolated Pawn", family: "pawn_structure", summary: "Isolated pawn structures require active piece compensation.", claimTypes: ["strategic_feature", "piece_activity"], requiredPieceTypes: ["pawn"] },
  { id: "doubled_pawn", label: "Doubled Pawn", family: "pawn_structure", summary: "Doubled pawns can weaken structure but may open files.", claimTypes: ["strategic_feature", "piece_activity"], requiredPieceTypes: ["pawn"] },
  { id: "backward_pawn", label: "Backward Pawn", family: "pawn_structure", summary: "Backward pawn weaknesses invite pressure on the file.", claimTypes: ["strategic_feature", "pressure"], requiredPieceTypes: ["pawn"] },
  { id: "pawn_chain", label: "Pawn Chain", family: "pawn_structure", summary: "Pawn chains create structure and directional plans.", claimTypes: ["strategic_feature", "center_control"], requiredPieceTypes: ["pawn"] },
  { id: "pawn_majority", label: "Pawn Majority", family: "pawn_structure", summary: "Pawn majorities can support future pawn races or breaks.", claimTypes: ["strategic_feature", "pawn_break"], requiredPieceTypes: ["pawn"] },
  { id: "minority_attack", label: "Minority Attack", family: "pawn_structure", summary: "Minority pawn play can create structural targets.", claimTypes: ["pawn_break", "pressure", "strategic_feature"], requiredPieceTypes: ["pawn"], overclaimRisk: "medium" },
  { id: "space_gain", label: "Space Gain", family: "space", summary: "Gain room for pieces while limiting opponent mobility.", claimTypes: ["piece_activity", "center_control", "strategic_feature"], requiredPieceTypes: ["pawn"] },
  { id: "create_escape_square", label: "Create Escape Square", family: "pawn_structure", summary: "Use pawn structure to create king escape options.", claimTypes: ["king_safety", "strategic_feature"], requiredPieceTypes: ["pawn"] },
  { id: "avoid_weakening_dark_squares", label: "Avoid Weakening Dark Squares", family: "pawn_structure", summary: "Avoid pawn moves that create lasting dark-square weaknesses.", claimTypes: ["strategic_feature", "king_safety"], requiredPieceTypes: ["pawn"] },
  { id: "avoid_weakening_light_squares", label: "Avoid Weakening Light Squares", family: "pawn_structure", summary: "Avoid pawn moves that create lasting light-square weaknesses.", claimTypes: ["strategic_feature", "king_safety"], requiredPieceTypes: ["pawn"] },

  { id: "defend_threat", label: "Defend Threat", family: "defense", summary: "Address immediate threats before pursuing expansion.", claimTypes: ["strategic_feature", "king_safety", "pressure"] },
  { id: "prophylaxis", label: "Prophylaxis", family: "defense", summary: "Prevent the opponent's active ideas in advance.", claimTypes: ["strategic_feature", "opening_plan"], optionalClaimTypes: ["strategic_feature"], themeTags: ["prophylaxis"] },
  { id: "overprotection", label: "Overprotection", family: "defense", summary: "Reinforce key squares to stabilize central and tactical control.", claimTypes: ["strategic_feature", "center_control"] },
  { id: "trade_when_ahead", label: "Trade When Ahead", family: "defense", summary: "Simplify when positional or tactical advantage is reliable.", claimTypes: ["candidate_comparison", "strategic_feature"], minStrength: "probable", requiresEngineEvidence: true, overclaimRisk: "medium" },
  { id: "simplify_position", label: "Simplify Position", family: "defense", summary: "Exchange pieces to reduce tactical volatility when appropriate.", claimTypes: ["strategic_feature", "candidate_comparison"], overclaimRisk: "medium" },
  { id: "consolidate_advantage", label: "Consolidate Advantage", family: "defense", summary: "Stabilize gains before launching new tactical operations.", claimTypes: ["strategic_feature", "safe_fallback"] },
  { id: "cover_escape_square", label: "Cover Escape Square", family: "defense", summary: "Control key escape routes in tactical operations.", claimTypes: ["pressure", "king_safety", "tactical_motif"] },
  { id: "remove_opponent_counterplay", label: "Remove Opponent Counterplay", family: "defense", summary: "Reduce active counter-threats before committing elsewhere.", claimTypes: ["strategic_feature", "pressure"] },
  { id: "avoid_tactical_blunder", label: "Avoid Tactical Blunder", family: "mistake_pattern", summary: "Prefer moves that avoid immediate tactical loss patterns.", claimTypes: ["safe_fallback", "tactical_motif"], minStrength: "probable", forbiddenWithoutEvidence: ["blunder"] },
  { id: "safety_fallback_explain_legal_move", label: "Safety Fallback Explain Legal Move", family: "safety_fallback", summary: "Use grounded legal-move explanation when stronger claims are unavailable.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true, overclaimRisk: "low" },

  { id: "italian_bishop_c4_pressure", label: "Italian Bishop c4 Pressure", family: "opening_specific", summary: "In Italian structures, bishop development toward c4 often supports f7 pressure.", claimTypes: ["development", "pressure"], requiredPieceTypes: ["bishop"], themeTags: ["italian_game"], optionalClaimTypes: ["opening_plan"] },
  { id: "italian_c3_d4_plan", label: "Italian c3 d4 Plan", family: "opening_specific", summary: "Prepare c3 and d4 to challenge the center in Italian structures.", claimTypes: ["center_control", "pawn_break", "opening_plan"], requiredPieceTypes: ["pawn"], themeTags: ["italian_game"] },
  { id: "ruy_lopez_bishop_b5_pressure", label: "Ruy Lopez Bishop b5 Pressure", family: "opening_specific", summary: "Ruy Lopez bishop pressure can support central control plans.", claimTypes: ["pressure", "development", "opening_plan"], requiredPieceTypes: ["bishop"], themeTags: ["ruy_lopez"] },
  { id: "queens_gambit_c4_center_challenge", label: "Queen's Gambit c4 Center Challenge", family: "opening_specific", summary: "c4 challenges Black's d5 center in Queen's Gambit structures.", claimTypes: ["center_control", "pawn_break", "opening_plan"], requiredPieceTypes: ["pawn"], themeTags: ["queens_gambit"] },
  { id: "sicilian_c5_center_challenge", label: "Sicilian c5 Center Challenge", family: "opening_specific", summary: "Sicilian c5 contests d4 and central expansion plans.", claimTypes: ["center_control", "pawn_break", "opening_plan"], requiredPieceTypes: ["pawn"], themeTags: ["sicilian"] },
  { id: "french_d5_center_challenge", label: "French d5 Center Challenge", family: "opening_specific", summary: "French d5 structure directly challenges White's center.", claimTypes: ["center_control", "pawn_break", "opening_plan"], requiredPieceTypes: ["pawn"], themeTags: ["french_defense"] },
  { id: "caro_kann_c6_d5_structure", label: "Caro-Kann c6 d5 Structure", family: "opening_specific", summary: "Caro-Kann setup builds resilient central structure with c6 and d5.", claimTypes: ["center_control", "opening_plan", "strategic_feature"], requiredPieceTypes: ["pawn"], themeTags: ["caro_kann"] },
  { id: "kings_indian_fianchetto_setup", label: "King's Indian Fianchetto Setup", family: "opening_specific", summary: "Fianchetto development supports king safety and dark-square pressure.", claimTypes: ["king_safety", "development", "opening_plan"], requiredPieceTypes: ["bishop"], themeTags: ["kings_indian"] },

  { id: "continue_from_here_available", label: "Continue From Here Available", family: "continuation", summary: "Branch completion can safely offer a continuation option.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
  { id: "continuation_candidate_locked", label: "Continuation Candidate Locked", family: "continuation", summary: "A continuation candidate is locked by runtime authority.", claimTypes: ["candidate_comparison", "safe_fallback"], minStrength: "probable", leakRisk: "high", allowInPlainBeforeShowMore: false },
  { id: "human_like_continuation", label: "Human-Like Continuation", family: "continuation", summary: "Continuation should prioritize human-practical candidate quality.", claimTypes: ["candidate_comparison", "strategic_feature"], minStrength: "probable", requiresEngineEvidence: true, overclaimRisk: "medium" },
  { id: "no_candidate_before_continue", label: "No Candidate Before Continue", family: "continuation", summary: "Do not expose continuation target before the continue step.", claimTypes: ["safe_fallback"], minStrength: "probable", leakRisk: "high", allowInPlainBeforeShowMore: true },
  { id: "branch_complete_no_target", label: "Branch Complete No Target", family: "continuation", summary: "At branch completion, no direct user target should be taught.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
  { id: "opponent_reply_no_user_target", label: "Opponent Reply No User Target", family: "continuation", summary: "When opponent is replying, suppress user-target instruction concepts.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
  { id: "plain_mode_recall", label: "Plain Mode Recall", family: "mistake_pattern", summary: "Plain mode should keep hints abstract until reveal policy allows detail.", claimTypes: ["safe_fallback", "strategic_feature"], minStrength: "probable", allowInPlainBeforeShowMore: true },
  { id: "show_more_reveal", label: "Show More Reveal", family: "visual_pattern", summary: "Show More can reveal richer guidance under safety gating.", claimTypes: ["safe_fallback", "strategic_feature"], minStrength: "probable", leakRisk: "high", allowInPlainBeforeShowMore: false },
  { id: "visual_target_alignment", label: "Visual Target Alignment", family: "visual_pattern", summary: "Visual cues must align with the locked target authority.", claimTypes: ["strategic_feature", "piece_activity"], minStrength: "probable", leakRisk: "high", allowInPlainBeforeShowMore: false },
  { id: "mismatch_blocked", label: "Mismatch Blocked", family: "safety_fallback", summary: "Suppress concept activation when target or piece evidence conflicts.", claimTypes: ["safe_fallback", "human_mistake"], minStrength: "probable", requiresEngineEvidence: true, leakRisk: "high", overclaimRisk: "high", forbiddenWithoutEvidence: ["best", "forced", "only move", "wins", "winning", "refutes", "blunder"] },
];

function defaultPlainTemplate(concept: ConceptSpec): string {
  return `Focus on ${concept.label.toLowerCase()} using only verified board evidence.`;
}

function buildConcept(spec: ConceptSpec): TeachingConcept {
  const claimTypes = spec.claimTypes ?? DEFAULT_CLAIM_TYPES_BY_FAMILY[spec.family];
  const leakRisk = spec.leakRisk ?? (HIGH_LEAK_IDS.has(spec.id) ? "high" : "low");
  const forbiddenTokens = leakRisk === "high" ? ["{targetSan}", "{targetUci}", "{from}", "{to}"] : [];

  return {
    id: spec.id,
    label: spec.label,
    family: spec.family,
    eloBands: [...DEFAULT_ELO_BANDS],
    summary: spec.summary,
    requiredEvidence: {
      claimTypes,
      minStrength: spec.minStrength ?? (STRONG_EVIDENCE_IDS.has(spec.id) ? "verified" : "probable"),
      requiredPieceTypes: spec.requiredPieceTypes,
      requiredMoveFlags: spec.requiredMoveFlags,
    },
    optionalEvidence: {
      claimTypes: spec.optionalClaimTypes,
      themeTags: spec.themeTags,
    },
    forbiddenWithoutEvidence:
      spec.forbiddenWithoutEvidence
      ?? (STRONG_EVIDENCE_IDS.has(spec.id) ? [...STRONG_TERMS] : []),
    plainHintTemplate: {
      leakRisk,
      template: spec.plainHintTemplate ?? defaultPlainTemplate(spec),
      forbiddenTokens,
    },
    assistedTemplate: {
      template: spec.assistedTemplate ?? "Use {conceptLabel} with evidence from {evidenceSummary}.",
      requiredSlots: spec.assistedSlots ?? ["conceptLabel", "evidenceSummary"],
    },
    showMoreTemplate: {
      template: spec.showMoreTemplate ?? "Detail how {conceptLabel} follows from {evidenceSummary} and board truth.",
      requiredSlots: spec.showMoreSlots ?? ["conceptLabel", "evidenceSummary", "boardTruth"],
    },
    visualPreferences: spec.visualPreferences ?? {
      preferArrow: true,
      preferSourceHighlight: true,
      preferDestinationHighlight: true,
      preferPressureArrow: spec.family === "tactics" || spec.family === "piece_activity" || spec.family === "center",
      preferKingSafetyAura: spec.family === "king_safety",
      preferPawnBreakMarker: spec.family === "center" || spec.family === "pawn_structure",
    },
    safety: {
      allowInPlainBeforeShowMore: spec.allowInPlainBeforeShowMore ?? !HIGH_LEAK_IDS.has(spec.id),
      requiresBoardTruth: spec.requiresBoardTruth ?? true,
      requiresEngineEvidence: spec.requiresEngineEvidence ?? ENGINE_GATED_IDS.has(spec.id),
      overclaimRisk: spec.overclaimRisk ?? (STRONG_EVIDENCE_IDS.has(spec.id) ? "high" : "medium"),
    },
  };
}

export const teachingConceptRegistry: TeachingConcept[] = REQUIRED_CONCEPT_SPECS.map(buildConcept);

const conceptById = new Map<string, TeachingConcept>(teachingConceptRegistry.map((concept) => [concept.id, concept]));

export function getTeachingConceptById(id: string): TeachingConcept | null {
  return conceptById.get(id) ?? null;
}

export function getTeachingConceptsByFamily(family: ConceptFamily): TeachingConcept[] {
  return teachingConceptRegistry.filter((concept) => concept.family === family);
}

function hasEmptyTemplate(concept: TeachingConcept): boolean {
  return !concept.plainHintTemplate.template.trim()
    || !concept.assistedTemplate.template.trim()
    || !concept.showMoreTemplate.template.trim();
}

export function validateTeachingConceptRegistry(): {
  valid: boolean;
  issues: string[];
  conceptCount: number;
  ids: string[];
} {
  const issues: string[] = [];
  const ids = teachingConceptRegistry.map((concept) => concept.id);
  const uniqueIds = new Set(ids);

  if (teachingConceptRegistry.length < 80) {
    issues.push(`registry has ${teachingConceptRegistry.length} concepts; expected at least 80`);
  }

  if (uniqueIds.size !== ids.length) {
    issues.push("duplicate concept IDs detected");
  }

  for (const concept of teachingConceptRegistry) {
    if (!concept.label.trim()) issues.push(`${concept.id}: label missing`);
    if (!concept.summary.trim()) issues.push(`${concept.id}: summary missing`);
    if (concept.requiredEvidence.claimTypes.length === 0) issues.push(`${concept.id}: requiredEvidence.claimTypes empty`);
    if (!Array.isArray(concept.forbiddenWithoutEvidence)) issues.push(`${concept.id}: forbiddenWithoutEvidence missing array`);
    if (hasEmptyTemplate(concept)) issues.push(`${concept.id}: one or more templates empty`);
    if (concept.plainHintTemplate.leakRisk === "high") {
      const lower = concept.plainHintTemplate.template.toLowerCase();
      if (["{targetsan}", "{targetuci}", "{from}", "{to}", "san", "uci"].some((token) => lower.includes(token))) {
        issues.push(`${concept.id}: high leak plain template contains target leakage tokens`);
      }
    }

    const joined = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
    const hasStrongTerm = STRONG_TERMS.some((token) => joined.includes(token));
    if (hasStrongTerm && concept.forbiddenWithoutEvidence.length === 0) {
      issues.push(`${concept.id}: strong terms present without forbiddenWithoutEvidence gating`);
    }

    if (OPENING_CONCEPT_IDS.has(concept.id) && !(concept.optionalEvidence?.themeTags?.length)) {
      issues.push(`${concept.id}: opening-specific concept missing opening theme tags`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    conceptCount: teachingConceptRegistry.length,
    ids,
  };
}
