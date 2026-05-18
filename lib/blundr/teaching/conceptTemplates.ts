import type { TeachingConceptId } from "./teachingCueTypes";

type TemplateOutput = { title: string; snippet: string; next?: string };

function fallbackMove(context: Record<string, unknown>): string {
  const value = context.moveSan;
  return typeof value === "string" && value.trim() ? value.trim() : "this move";
}

export function renderTeachingTemplate(conceptId: TeachingConceptId, context: Record<string, unknown>): TemplateOutput {
  const moveSan = fallbackMove(context);

  switch (conceptId) {
    case "attack_loose_piece":
      return { title: "Attack the loose piece", snippet: "Create pressure before it can be defended." };
    case "win_loose_piece":
      return { title: "Win the loose piece", snippet: "The target is loose, and this move takes it now." };
    case "hanging_piece_warning":
      return { title: "Watch the loose piece", snippet: "One piece is not safely defended." };
    case "king_safety_first":
      return { title: "King safety first", snippet: "Do not open the center with the king exposed." };
    case "center_tension":
      return { title: "Center tension", snippet: "Resolve the central fight on your terms." };
    case "center_control":
      return { title: "Claim the center", snippet: "The center decides where your pieces belong." };
    case "development_lag":
      return { title: "Finish development", snippet: "Bring the last piece in before starting tactics." };
    case "improve_worst_piece":
      return { title: "Improve the worst piece", snippet: "Your least active piece should join the fight." };
    case "open_file_context":
      return { title: "Use the open file", snippet: "The file gives your heavy pieces a lane." };
    case "weak_square":
      return { title: "Use the weak square", snippet: "A square they cannot defend becomes a home." };
    case "pawn_break":
      return { title: "Prepare the break", snippet: "The pawn break changes the structure." };
    case "prophylaxis":
      return { title: "Stop their idea", snippet: "First notice what your opponent wants next." };
    case "coordinate_pieces":
      return { title: "Coordinate your pieces", snippet: "The tactic appears when pieces aim together." };
    case "strong_alternative":
      return { title: "Strong alternative", snippet: "Playable, but it teaches a different idea." };
    case "book_pattern":
      return { title: "Known pattern", snippet: "This move follows a trusted opening idea." };
    case "endgame_activity":
    case "king_activity":
      return { title: "Activate the king", snippet: "In the endgame, the king becomes a piece." };
    case "rook_activity":
      return { title: "Activate the rook", snippet: "Rooks belong on open files and behind passers." };
    case "passed_pawn":
      return { title: "Push the passer", snippet: "Passed pawns become stronger as they advance." };
    case "context_only":
      return { title: "Assisted context", snippet: "A safe positional theme is available here." };
    case "immediate_tactic":
      return { title: "Immediate tactic", snippet: "A forcing tactical idea is available now." };
    case "pressure_target":
      return { title: "Increase pressure", snippet: "Improve pressure on a key target square." };
    case "piece_activity":
      return { title: "Increase activity", snippet: "Activate your pieces before making deep commitments." };
    case "half_open_file":
      return { title: "Use the half-open file", snippet: "Your heavy pieces can pressure this file." };
    case "outpost":
      return { title: "Build an outpost", snippet: "Secure a stable square for your piece." };
    case "bad_piece":
      return { title: "Fix the bad piece", snippet: "Re-route the least useful piece first." };
    default:
      return { title: "Follow the pattern", snippet: `${moveSan} matches the validated training line.` };
  }
}
