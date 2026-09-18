export function resolveTrainBoardWorkspaceMaxWidth(showEvalBar: boolean): string {
  return showEvalBar
    ? "min(720px, 100%, calc(100dvh - 21rem))"
    : "min(720px, 100%, calc(100dvh - 17.5rem))";
}
