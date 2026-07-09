import type { MiniGameGenerationCandidate, MiniGameSolutionVerificationResult, MiniGameScenarioValidationIssue } from "./miniGameGenerationTypes";
import { isLegalMove } from "./miniGameMoveRules";
import { validateMiniGameObjective } from "./miniGameObjectiveValidation";

function issue(code: string, message: string, path?: string): MiniGameScenarioValidationIssue {
  return { code, message, path };
}

export function verifyMiniGameSolution(candidate: MiniGameGenerationCandidate): MiniGameSolutionVerificationResult {
  const notes: string[] = [];
  const issues: MiniGameScenarioValidationIssue[] = [];

  if (!isLegalMove(candidate.board.fen, candidate.solution.primaryMoveUci)) {
    return {
      verified: false,
      verifier: "illegal_move",
      objectiveScore: 0,
      notes: ["primary move is illegal"],
      issues: [issue("illegal_move", "Primary solution move is illegal.", "solution.primaryMoveUci")],
    };
  }

  const objective = validateMiniGameObjective(candidate);
  if (!objective.passed) {
    return {
      verified: false,
      verifier: "objective_validation_failed",
      objectiveScore: objective.objectiveScore,
      notes: objective.notes,
      issues: objective.issues,
    };
  }

  const acceptedMoves = candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci];
  if (!acceptedMoves.length) {
    return {
      verified: false,
      verifier: "no_accepted_moves",
      objectiveScore: objective.objectiveScore,
      notes: ["accepted moves missing"],
      issues: [issue("empty_accepted_moves", "Accepted moves are missing.", "solution.acceptedMoves")],
    };
  }

  for (const move of acceptedMoves) {
    if (!isLegalMove(candidate.board.fen, move)) {
      return {
        verified: false,
        verifier: "illegal_accepted_move",
        objectiveScore: objective.objectiveScore,
        notes: [`illegal accepted move: ${move}`],
        issues: [issue("illegal_accepted_move", `Accepted move ${move} is illegal.`, "solution.acceptedMoves")],
      };
    }
  }

  notes.push(...objective.notes);
  notes.push("primary move verified");
  return {
    verified: true,
    verifier: "objective_verifier",
    objectiveScore: objective.objectiveScore,
    notes,
    issues,
  };
}
