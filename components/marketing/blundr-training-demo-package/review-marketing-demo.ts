export const reviewMarketingDemo = {
  opening: "Fried Liver Attack",
  line: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5",
  orientation: "white" as const,
  startingFen: "r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5",
  incorrectFen: "r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6",
  completedFen: "r1bqkb1r/ppp2ppp/5n2/n2Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 1 6",
  incorrectMove: { from: "f6", to: "d5", san: "Nxd5?" },
  correctMove: { from: "c6", to: "a5", san: "Na5" },
  missExplanation:
    "The natural recapture allows White to attack f7. Blundr saves the position so you can retry the idea.",
  successExplanation:
    "Na5 attacks the bishop and sidesteps the attack on f7.",
  wrongHighlightAtMs: 1100,
  wrongMoveAtMs: 1750,
  missAtMs: 2300,
  replayAtMs: 3900,
  correctHighlightAtMs: 4900,
  correctMoveAtMs: 5550,
  successAtMs: 6150,
  updatedAtMs: 7500,
  durationMs: 9400,
} as const;
