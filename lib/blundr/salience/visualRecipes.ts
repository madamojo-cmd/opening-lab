import type { BlundrFeaturePacket, BlundrVisualModelOutput, VisualCue, VisualLine, VisualView } from "../featurePacketBuilder";
import { isBoardSquare } from "../geometry/lineGeometry";
import type { SalienceConcept } from "./conceptLabeler";
import type { TeachingCandidate } from "./salienceScorer";

const CONCEPT_ANIMATION: Record<SalienceConcept, string> = {
  quiet_development: "quiet-development-glow",
  development_with_f7_pressure: "diagonal-pressure-glow",
  development_with_f2_pressure: "diagonal-pressure-glow",
  knight_pressure_center: "knight-pressure-center",
  center_control: "center-break-pulse",
  center_tension: "center-break-pulse",
  prepare_center_break: "center-break-pulse",
  pawn_break: "center-break-pulse",
  castle_for_safety: "castle-safety-aura",
  queen_danger_warning: "queen-danger-warning",
  pin_pressure: "pin-line-tension",
  open_file_pressure: "open-file-radar",
  continuation_plan: "continuation-ghost-plan",
  generic_stockfish_best_move: "continuation-ghost-plan",
};

const TEMPLATE: Record<SalienceConcept, { title: string; message: string; explanation: string }> = {
  quiet_development: {
    title: "Quiet development",
    message: "Develop the piece and improve its useful squares.",
    explanation: "The move is selected for clean development and mobility, not for an invented tactic.",
  },
  development_with_f7_pressure: {
    title: "Develop with f7 pressure",
    message: "The developed bishop or queen line points at f7.",
    explanation: "The diagonal pressure is backed by the computed line geometry.",
  },
  development_with_f2_pressure: {
    title: "Develop with f2 pressure",
    message: "The developed bishop or queen line points at f2.",
    explanation: "The diagonal pressure is backed by the computed line geometry.",
  },
  knight_pressure_center: {
    title: "Knight pressure",
    message: "The knight improves and presses central squares.",
    explanation: "The highlighted central pressure comes from the move delta, not from a guessed tactic.",
  },
  center_control: {
    title: "Center control",
    message: "The move increases control of the center.",
    explanation: "Central squares are salient in the deterministic influence delta.",
  },
  center_tension: {
    title: "Center tension",
    message: "The move changes contested central squares.",
    explanation: "The selector found central tension in the post-move influence map.",
  },
  prepare_center_break: {
    title: "Prepare the break",
    message: "The move prepares or strengthens a central break.",
    explanation: "Central-square salience makes this the clearest teaching cue.",
  },
  pawn_break: {
    title: "Pawn break",
    message: "The pawn move changes the central structure.",
    explanation: "The visual cue is based on central move-delta evidence.",
  },
  castle_for_safety: {
    title: "Castle for safety",
    message: "Move the king to safety and connect the rook.",
    explanation: "Castling is verified as a legal chess.js move.",
  },
  queen_danger_warning: {
    title: "Queen danger",
    message: "The move creates a verified queen-tempo warning.",
    explanation: "Queen danger is only shown when the salience facts touch the queen.",
  },
  pin_pressure: {
    title: "Pin pressure",
    message: "The line creates pressure through a pinned piece.",
    explanation: "Pin pressure is only shown when line evidence supports it.",
  },
  open_file_pressure: {
    title: "Open file pressure",
    message: "The rook or queen line gains file or rank pressure.",
    explanation: "Open-file pressure is based on slider line evidence.",
  },
  continuation_plan: {
    title: "Continuation plan",
    message: "Continue the verified repertoire move.",
    explanation: "The selected plan is anchored to a legal candidate.",
  },
  generic_stockfish_best_move: {
    title: "Engine-backed plan",
    message: "Follow the verified Stockfish candidate.",
    explanation: "The selected plan comes from the engine candidate list.",
  },
};

export function animationForConcept(concept: SalienceConcept): string {
  return CONCEPT_ANIMATION[concept] ?? "continuation-ghost-plan";
}

export function renderContextTemplate(concept: SalienceConcept, candidate: TeachingCandidate, packet: BlundrFeaturePacket): { title: string; message: string; explanation: string } {
  const template = TEMPLATE[concept] ?? TEMPLATE.continuation_plan;
  const move = candidate.san ?? candidate.selectedMove;
  const opening = packet.openingName ? `${packet.openingName}: ` : "";

  return {
    title: `${opening}${template.title}`.slice(0, 80),
    message: `${move}: ${template.message}`.slice(0, 300),
    explanation: template.explanation,
  };
}

function uniqueSquares(squares: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const square of squares) {
    if (!isBoardSquare(square) || seen.has(square)) {
      continue;
    }
    seen.add(square);
    out.push(square);
    if (out.length >= max) {
      break;
    }
  }
  return out;
}

function line(from: string, to: string, kind: VisualLine["kind"], label?: string, reason?: string, score?: number): VisualLine {
  return { from, to, kind, role: kind === "plan" ? "move" : kind, label, reason, score };
}

function bestPressureArrow(candidate: TeachingCandidate): VisualLine | null {
  const concept = candidate.concept;
  const target =
    concept === "development_with_f7_pressure"
      ? "f7"
      : concept === "development_with_f2_pressure"
        ? "f2"
        : undefined;

  if (target) {
    const pressureLine = candidate.topLines.find((changedLine) => changedLine.lineSquares.includes(target));
    return line(candidate.moveDelta.to, target, "attack", "pressure", concept, pressureLine?.salience ?? 50);
  }

  if (concept === "knight_pressure_center") {
    const central = candidate.topSquares.find((square) => ["d4", "e4", "d5", "e5"].includes(square.square) && square.attackGain > 0);
    if (central) {
      return line(candidate.moveDelta.to, central.square, "attack", "center", "knight pressure", central.totalSalience);
    }
  }

  const slider = candidate.topLines[0];
  if (["queen_danger_warning", "pin_pressure", "open_file_pressure"].includes(concept) && slider) {
    return line(slider.from, slider.to, "attack", slider.role, concept, slider.salience);
  }

  return null;
}

function cuesFor(candidate: TeachingCandidate, kind: VisualCue["kind"] = "target"): VisualCue[] {
  return uniqueSquares(
    [candidate.moveDelta.to, ...candidate.topSquares.map((square) => square.square)],
    4,
  ).map((square) => ({
    square,
    kind: square === candidate.moveDelta.to ? "target" : kind,
    role: square === candidate.moveDelta.to ? "destination" : kind,
    score: candidate.topSquares.find((changed) => changed.square === square)?.totalSalience,
    reason: square === candidate.moveDelta.to ? "move destination" : "salient changed square",
  }));
}

function view(title: string, message: string, lines: VisualLine[], cues: VisualCue[], insight: string): VisualView {
  return {
    title,
    message,
    lines: lines.slice(0, 2),
    cues: cues.slice(0, 4),
    insight,
  };
}

export function renderVisualRecipe(candidate: TeachingCandidate, packet: BlundrFeaturePacket): BlundrVisualModelOutput {
  const context = renderContextTemplate(candidate.concept, candidate, packet);
  const moveArrow = line(candidate.moveDelta.from, candidate.moveDelta.to, "plan", candidate.san, "selected legal move", 999);
  const pressureArrow = bestPressureArrow(candidate);
  const planArrows = pressureArrow ? [moveArrow, pressureArrow].slice(0, 2) : [moveArrow];
  const keySquares = uniqueSquares(
    [candidate.moveDelta.to, ...candidate.topSquares.map((square) => square.square)],
    4,
  );
  const attackLines = pressureArrow ? [pressureArrow] : candidate.topLines.slice(0, 1).map((changedLine) => line(changedLine.from, changedLine.to, "attack", changedLine.role, "salient line", changedLine.salience));
  const planCues = cuesFor(candidate, "target");
  const supportCues = [{ square: candidate.moveDelta.from, kind: "origin" as const, role: "source", reason: "move source" }, ...planCues].slice(0, 4);
  const animationName = animationForConcept(candidate.concept);

  return {
    source: "salience-selector",
    fallback: false,
    selectedView: packet.selectedView,
    headline: context.title,
    mainExplanation: context.message,
    visualExplanation: context.explanation,
    planExplanation: `Use ${candidate.san ?? candidate.selectedMove} because the salience engine found ${candidate.concept.replaceAll("_", " ")}.`,
    nextPlan: `Play ${candidate.san ?? candidate.selectedMove}.`,
    keySquares,
    planArrows,
    arrows: planArrows,
    squares: planCues,
    animationPackage: { name: animationName, intensity: Math.max(0.25, Math.min(1, candidate.confidence)) },
    context: {
      headline: context.title,
      body: context.message,
      next: `Play ${candidate.san ?? candidate.selectedMove}.`,
      concept: candidate.concept,
      selectedMove: candidate.selectedMove,
    },
    attack: view(context.title, context.message, attackLines, planCues, context.explanation),
    defense: view("Safety check", "No defensive warning is shown unless the salience packet provides evidence.", [], supportCues, "Defensive visuals remain conservative."),
    plan: view("Verified plan", `Play ${candidate.san ?? candidate.selectedMove}.`, planArrows, planCues, `Score ${candidate.score.toFixed(1)} from deterministic salience.`),
    threatNote: candidate.concept.includes("pressure") || candidate.concept.includes("danger") ? context.message : "",
    suppress: [],
    confidence: candidate.confidence.toFixed(2),
    animation: animationName,
    debug: {
      selectedMove: candidate.selectedMove,
      concept: candidate.concept,
      score: candidate.score,
      scoreBreakdown: candidate.scoreBreakdown,
      animation: animationName,
    },
  };
}
