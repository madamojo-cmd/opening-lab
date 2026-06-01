export type CastlingVisualSquares = {
  side: "kingside" | "queenside";
  kingFrom: string;
  kingTo: string;
  rookFrom: string;
  rookTo: string;
};

export function getCastlingVisualSquares(input: { uci?: string; san?: string }): CastlingVisualSquares | null {
  const uci = (input.uci ?? "").toLowerCase();
  const san = (input.san ?? "").replace(/0/g, "O").replace(/[+#?!]/g, "");
  if (uci === "e1g1" || san === "O-O") return { side: "kingside", kingFrom: "e1", kingTo: "g1", rookFrom: "h1", rookTo: "f1" };
  if (uci === "e8g8") return { side: "kingside", kingFrom: "e8", kingTo: "g8", rookFrom: "h8", rookTo: "f8" };
  if (uci === "e1c1" || san === "O-O-O") return { side: "queenside", kingFrom: "e1", kingTo: "c1", rookFrom: "a1", rookTo: "d1" };
  if (uci === "e8c8") return { side: "queenside", kingFrom: "e8", kingTo: "c8", rookFrom: "a8", rookTo: "d8" };
  return null;
}
