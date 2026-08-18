import { Chess } from "chess.js";

export function isTempoCompletionEligible(input: {
  trainingMode: "restricted" | "continuation";
  bookComplete: boolean;
  branchCompleteEligible: boolean;
  terminalProof: boolean;
}): boolean {
  return (
    input.trainingMode === "restricted" &&
    (input.bookComplete ||
      (input.branchCompleteEligible && input.terminalProof))
  );
}

function normalizedUci(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isBatteryCompletionEligible(input: {
  trainingMode: "restricted" | "continuation";
  userEnteredContinuation: boolean;
  completedFen: string;
  lastMoveUci: string | null | undefined;
  lastMoveColor: "w" | "b" | null | undefined;
  userColor: "w" | "b";
}): boolean {
  const lastMoveUci = normalizedUci(input.lastMoveUci);
  if (
    input.trainingMode !== "continuation" ||
    !input.userEnteredContinuation ||
    !lastMoveUci ||
    input.lastMoveColor !== input.userColor
  ) {
    return false;
  }

  try {
    const game = new Chess(input.completedFen);
    return game.isCheckmate();
  } catch {
    return false;
  }
}
