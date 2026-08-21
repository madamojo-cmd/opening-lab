export function resolveTrainBoardWorkspaceMaxWidth(showEvalBar: boolean): string {
  return showEvalBar
    ? "min(100%, calc(100dvh - 21.5rem))"
    : "min(100%, calc(100dvh - 17.5rem))";
}
