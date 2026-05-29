import type { TeachingConceptId, TeachingCueMode } from "./teachingCueTypes";

type TemplateOutput = { title: string; snippet: string; next?: string };

export type ConceptTemplateVariables = {
  moveSan?: string;
  pieceName?: string;
  fromSquare?: string;
  toSquare?: string;
  targetSquare?: string;
  targetPiece?: string;
  file?: string;
  diagonal?: string;
  centerSquares?: string;
  weakness?: string;
  opponentIdea?: string;
  alternativeTheme?: string;
  mainLineTheme?: string;
};

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function piece(vars: ConceptTemplateVariables): string {
  return text(vars.pieceName, "piece");
}

function targetSquare(vars: ConceptTemplateVariables): string {
  return text(vars.targetSquare, "the target");
}

function targetPiece(vars: ConceptTemplateVariables): string {
  return text(vars.targetPiece, "target");
}

export function renderConceptTemplate(conceptId: TeachingConceptId, variables: ConceptTemplateVariables = {}, mode: TeachingCueMode = "move_teaching"): TemplateOutput {
  const pieceName = piece(variables);
  const square = targetSquare(variables);
  const file = text(variables.file, "");
  const centers = text(variables.centerSquares, "the center");

  switch (conceptId) {
    case "develops_with_pressure":
    case "development_with_pressure":
      return { title: "Develop with pressure", snippet: `The ${pieceName} joins the game and pressures ${square}.` };
    case "develop_and_control":
      return { title: "Develop and control", snippet: `The ${pieceName} develops while fighting for the center.` };
    case "improves_piece_activity":
    case "improve_worst_piece":
    case "piece_activity":
      return { title: `Improve the ${pieceName}`, snippet: "Choose a square where it creates pressure." };
    case "same_piece_active_square":
      return { title: "Choose the active square", snippet: "The same piece can develop with more purpose." };
    case "active_square_comparison":
      return { title: `Improve the ${pieceName}`, snippet: "The active square matters more than simple development." };
    case "passive_development":
    case "development_lag":
      return { title: "Develop with purpose", snippet: "Development matters most when it creates a threat." };
    case "attack_loose_piece":
    case "attacks_loose_piece":
      return { title: "Attack the loose piece", snippet: `Pressure the ${targetPiece(variables)} before it can be defended.` };
    case "win_loose_piece":
    case "wins_loose_piece":
      return { title: "Win the loose piece", snippet: `The ${targetPiece(variables)} is loose, and this move takes it now.` };
    case "hanging_piece_warning":
    case "loose_piece_warning":
      return { title: "Watch the loose piece", snippet: `The ${targetPiece(variables)} is not safely defended.` };
    case "center_tension":
      return { title: "Center tension", snippet: `The fight on ${centers} decides the plan.` };
    case "center_control":
      return { title: "Claim the center", snippet: "The center decides where your pieces belong." };
    case "king_safety_first":
      return { title: "King safety first", snippet: "The exposed king makes every central break sharper." };
    case "castle_for_safety":
      return { title: "Castle for safety", snippet: "The king moves to safety before the center opens." };
    case "open_file_context":
    case "open_file_pressure":
      return file
        ? { title: `Use the ${file}-file`, snippet: "The open file gives your heavy pieces a lane." }
        : { title: "Use the open file", snippet: "The open file gives your heavy pieces a lane." };
    case "weak_square":
      return { title: "Use the weak square", snippet: `${square} is hard for them to defend.` };
    case "outpost":
    case "outpost_control":
      return { title: "Build an outpost", snippet: `${square} can become a stable home for a piece.` };
    case "pawn_break":
    case "center_break":
      return { title: "Prepare the break", snippet: "The pawn break changes the structure." };
    case "prophylaxis":
    case "threat_prevention":
      return { title: "Stop their idea", snippet: "First notice what your opponent wants next." };
    case "coordinate_pieces":
    case "piece_coordination":
      return { title: "Coordinate your pieces", snippet: "The tactic appears when pieces aim together." };
    case "strong_alternative":
      return { title: "Strong alternative", snippet: "Playable, but it teaches a different idea." };
    case "book_pattern":
      return { title: "Known pattern", snippet: "This move follows a trusted opening idea." };
    case "endgame_activity":
    case "king_activity":
    case "king_activity_endgame":
      return { title: "Activate the king", snippet: "In the endgame, the king becomes a piece." };
    case "rook_activity":
    case "rook_activation":
      return { title: "Activate the rook", snippet: "Rooks belong on open files and behind passers." };
    case "passed_pawn":
    case "passed_pawn_push":
      return { title: "Push the passer", snippet: "Passed pawns grow stronger as they advance." };
    case "context_only":
      return { title: "Assisted context", snippet: mode === "context_only" ? "Focus on the key feature of the position." : "A safe positional theme is available here." };
    case "immediate_tactic":
      return { title: "Immediate tactic", snippet: "A forcing tactical idea is available now." };
    case "pressure_target":
      return { title: "Increase pressure", snippet: `${pieceName} can aim at ${square}.` };
    case "half_open_file":
      return file
        ? { title: `Use the ${file}-file`, snippet: "The half-open file gives pressure without a pawn." }
        : { title: "Use the half-open file", snippet: "Your heavy pieces can pressure this file." };
    case "bad_piece":
      return { title: "Fix the bad piece", snippet: `The ${pieceName} needs a more active job.` };
    default: {
      const moveSan = text(variables.moveSan, "This move");
      return { title: "Follow the pattern", snippet: `${moveSan} matches the validated training line.` };
    }
  }
}

export function renderTeachingTemplate(conceptId: TeachingConceptId, context: Record<string, unknown>): TemplateOutput {
  return renderConceptTemplate(conceptId, {
    moveSan: text(context.moveSan, ""),
    pieceName: text(context.pieceName, ""),
    fromSquare: text(context.fromSquare, ""),
    toSquare: text(context.toSquare, ""),
    targetSquare: text(context.targetSquare, ""),
    targetPiece: text(context.targetPiece, ""),
    file: text(context.file, ""),
    diagonal: text(context.diagonal, ""),
    centerSquares: text(context.centerSquares, ""),
    weakness: text(context.weakness, ""),
    opponentIdea: text(context.opponentIdea, ""),
    alternativeTheme: text(context.alternativeTheme, ""),
    mainLineTheme: text(context.mainLineTheme, ""),
  });
}
