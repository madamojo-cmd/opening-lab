export function shouldOfferMaiaOpponentRetry(input: {
  trainingMode: string;
  trainerPhase: string;
  maiaUnavailable: boolean;
  hasPendingRequest: boolean;
  gameOver: boolean;
  opponentToMove: boolean;
}): boolean {
  return (
    input.trainingMode === "continuation" &&
    input.trainerPhase === "error" &&
    input.maiaUnavailable &&
    !input.hasPendingRequest &&
    !input.gameOver &&
    input.opponentToMove
  );
}
