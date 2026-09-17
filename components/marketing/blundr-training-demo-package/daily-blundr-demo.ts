export const dailyBlundrDemo = {
  opening: "Queen’s Gambit Declined",
  line: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5",
  orientation: "black" as const,
  startingFen: "rnbqkb1r/ppp2ppp/4pn2/3P4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4",
  completedFen: "rnbqkb1r/ppp2ppp/5n2/3p4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5",
  expectedMove: { from: "e6", to: "d5", san: "exd5" },
  explanation:
    "Recapturing on d5 restores material and clears e6 so Black’s light-squared bishop can develop.",
  highlightAtMs: 1450,
  moveAtMs: 2100,
  resultAtMs: 2650,
  progressAtMs: 4700,
  nextAtMs: 6000,
  resetAtMs: 7200,
  durationMs: 7800,
} as const;

