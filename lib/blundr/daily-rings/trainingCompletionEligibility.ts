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

export function isBatteryCompletionEligible(input: {
  trainingMode: "restricted" | "continuation";
  userEnteredContinuation: boolean;
  moveUci: string | null | undefined;
  legal: boolean;
  stale: boolean;
}): boolean {
  return (
    input.trainingMode === "continuation" &&
    input.userEnteredContinuation &&
    Boolean(input.moveUci) &&
    input.legal &&
    !input.stale
  );
}
