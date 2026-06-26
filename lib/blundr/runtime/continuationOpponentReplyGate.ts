export function shouldScheduleContinuationOpponentReply(input: {
  trainingMode: "restricted" | "continuation";
  gameOver: boolean;
  turn: "w" | "b";
  userColor: "w" | "b";
  nextBranchCompleteEligible: boolean;
}): boolean {
  return (
    !input.gameOver &&
    input.turn !== input.userColor &&
    (input.trainingMode === "continuation" || !input.nextBranchCompleteEligible)
  );
}
