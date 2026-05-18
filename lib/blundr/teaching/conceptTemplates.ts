import type { TeachingConceptId } from "./teachingCueTypes";

type TemplateContext = Record<string, string | number | undefined>;

function txt(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function renderTeachingTemplate(conceptId: TeachingConceptId, context: TemplateContext): { title: string; snippet: string; next?: string } {
  const moveSan = txt(context.moveSan, "this move");
  const targetSquare = txt(context.targetSquare, "a key square");

  switch (conceptId) {
    case "development_with_pressure":
      return { title: "Develop with pressure", snippet: `${moveSan} develops a piece and pressures ${targetSquare}.` };
    case "quiet_development":
      return { title: "Develop a piece", snippet: `${moveSan} brings a piece into the game.` };
    case "center_control":
      return { title: "Fight for the center", snippet: `${moveSan} increases your control of the center.` };
    case "center_break":
      return { title: "Challenge the center", snippet: `${moveSan} attacks the center and opens lines for your pieces.` };
    case "space_gain":
      return { title: "Gain space", snippet: `${moveSan} claims space and improves piece routes.` };
    case "castle_for_safety":
      return { title: "Castle for safety", snippet: `${moveSan} moves the king to safety and connects the rook.` };
    case "king_safety_escape":
      return { title: "Keep the king safe", snippet: `${moveSan} reduces danger around your king.` };
    case "threat_prevention":
      return { title: "Stop the threat", snippet: `${moveSan} prevents your opponent's most direct idea.` };
    case "defensive_resource":
      return { title: "Find the defense", snippet: `${moveSan} stabilizes the position and protects key squares.` };
    case "recapture":
      return { title: "Recapture cleanly", snippet: `${moveSan} restores material balance without losing coordination.` };
    case "win_loose_piece":
      return { title: "Win the loose piece", snippet: "The target is not safely defended, so capture it now." };
    case "loose_piece_warning":
      return { title: "Watch loose pieces", snippet: `${moveSan} punishes an underdefended piece.` };
    case "pin_pressure":
      return { title: "Create pressure", snippet: `${moveSan} adds pressure because the target cannot move freely.` };
    case "skewer_pressure":
      return { title: "Skewer the line", snippet: `${moveSan} lines up a stronger target behind a weaker one.` };
    case "fork_creation":
      return { title: "Create a fork", snippet: `${moveSan} creates multiple threats at once.` };
    case "discovered_attack":
      return { title: "Discovered pressure", snippet: `${moveSan} uncovers a new line of attack.` };
    case "remove_defender":
      return { title: "Remove the defender", snippet: `${moveSan} removes a key defender and weakens the target.` };
    case "overload_defender":
      return { title: "Overload the defender", snippet: `${moveSan} forces one piece to defend too much.` };
    case "deflection":
      return { title: "Deflect the piece", snippet: `${moveSan} pulls a defender away from its post.` };
    case "clearance":
      return { title: "Clear the line", snippet: `${moveSan} clears a file or diagonal for active pieces.` };
    case "open_file_pressure":
      return { title: "Use the open file", snippet: `${moveSan} increases pressure along an open file.` };
    case "rook_activation":
      return { title: "Activate the rook", snippet: `${moveSan} places the rook on a more active square.` };
    case "piece_coordination":
      return { title: "Coordinate your pieces", snippet: `${moveSan} improves how your pieces work together.` };
    case "improve_worst_piece":
      return { title: "Improve the worst piece", snippet: `${moveSan} upgrades your least active piece.` };
    case "outpost_control":
      return { title: "Secure the outpost", snippet: `${moveSan} strengthens control of a durable square.` };
    case "queen_danger_warning":
      return { title: "Queen danger", snippet: `${moveSan} creates pressure near the queen's lines.` };
    case "trade_into_better_position":
      return { title: "Trade favorably", snippet: `${moveSan} steers the game into a better structure.` };
    case "avoid_bad_trade":
      return { title: "Avoid the bad trade", snippet: `${moveSan} keeps your better piece and structure.` };
    case "passed_pawn_push":
      return { title: "Push the passed pawn", snippet: `${moveSan} advances the passed pawn with purpose.` };
    case "promotion_race":
      return { title: "Win the race", snippet: `${moveSan} improves your promotion chances.` };
    case "king_activity_endgame":
      return { title: "Activate the king", snippet: `${moveSan} improves king activity in the endgame.` };
    case "opposition":
      return { title: "Take opposition", snippet: `${moveSan} gains key king opposition squares.` };
    case "zugzwang_pressure":
      return { title: "Increase pressure", snippet: `${moveSan} limits useful replies and builds pressure.` };
    case "checkmate_threat":
      return { title: "Create mate threat", snippet: `${moveSan} builds a direct mating threat.` };
    case "forcing_check":
      return { title: "Force with check", snippet: `${moveSan} checks and keeps the initiative.` };
    case "safe_capture":
      return { title: "Capture safely", snippet: `${moveSan} wins material without exposing your piece.` };
    case "default_pattern":
    default:
      return { title: "Follow the pattern", snippet: `${moveSan} matches the validated training line.` };
  }
}
