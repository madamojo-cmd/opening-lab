export type DemoArrow = readonly [from: string, to: string];

export const landingOpeningDemo = {
  opening: "Italian Game",
  orientation: "white" as const,
  line: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3",
  startingFen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  afterBishopFen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  afterC3Fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
  moves: [
    { from: "f8", to: "c5", san: "Bc5", atMs: 800 },
    { from: "c2", to: "c3", san: "c3", atMs: 3150 },
  ] as const,
  teaching: {
    bishopEmphasisAtMs: 1450,
    pawnHighlightAtMs: 2250,
    highlightedSquares: ["c2", "c3"] as const,
    arrows: [] as readonly DemoArrow[],
    title: "Why c3?",
    body: "c3 prepares the d4 break while keeping your bishop active on c4.",
    positionIdea: "Prepare d4",
  },
  cueAtMs: 3850,
  reviewAtMs: 5450,
  resetAtMs: 7600,
  durationMs: 8200,
} as const;
