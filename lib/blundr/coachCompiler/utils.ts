export function getPieceName(pieceType: string | null | undefined): string {
  if (!pieceType) return "piece";
  const map: Record<string, string> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };
  return map[pieceType.toLowerCase()] || "piece";
}
