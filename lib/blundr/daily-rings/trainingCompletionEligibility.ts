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
