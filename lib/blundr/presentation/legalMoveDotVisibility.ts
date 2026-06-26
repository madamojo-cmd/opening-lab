export function buildTrainingBoardVisibilitySquares(input: {
  instructionTargetFrom: string | null;
  instructionTargetTo: string | null;
  selectedSquare: string | null;
  selectedLegalMoveSquares: readonly string[];
}): Set<string> {
  const visibleSquares = new Set<string>();

  if (input.instructionTargetFrom) visibleSquares.add(input.instructionTargetFrom);
  if (input.instructionTargetTo) visibleSquares.add(input.instructionTargetTo);
  if (input.selectedSquare) visibleSquares.add(input.selectedSquare);
  for (const square of input.selectedLegalMoveSquares) {
    if (square) visibleSquares.add(String(square));
  }

  return visibleSquares;
}
