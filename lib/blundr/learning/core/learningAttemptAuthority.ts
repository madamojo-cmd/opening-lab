export function resolveLearningAttemptAuthority(input: {
  expectedMoveUci: string;
  playedMoveUci: unknown;
  requestedType: unknown;
  serverNow: string;
}):
  | {
      ok: true;
      taxonomy: "move_correct" | "move_incorrect" | "cue_revealed";
      correct: boolean;
      occurredAt: string;
    }
  | { ok: false; error: "invalid_played_move" } {
  if (input.requestedType === "cue_revealed")
    return {
      ok: true,
      taxonomy: "cue_revealed",
      correct: false,
      occurredAt: input.serverNow,
    };
  const played = String(input.playedMoveUci ?? "").trim();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(played))
    return { ok: false, error: "invalid_played_move" };
  return {
    ok: true,
    taxonomy:
      played === input.expectedMoveUci ? "move_correct" : "move_incorrect",
    correct: played === input.expectedMoveUci,
    occurredAt: input.serverNow,
  };
}
