export type SelectedRuntimeLineCompletionInput = {
  selectedRuntimeLinePlyLength: number;
  currentPly: number;
  resolverLineComplete: boolean;
  exactNodeHasChildren: boolean | "unknown";
};

export function isSelectedRuntimeLineComplete(
  input: SelectedRuntimeLineCompletionInput,
): boolean {
  const lineLength = Math.max(
    0,
    Math.floor(Number(input.selectedRuntimeLinePlyLength) || 0),
  );
  const currentPly = Math.max(0, Math.floor(Number(input.currentPly) || 0));
  if (lineLength > 0) return currentPly >= lineLength;
  return Boolean(
    input.resolverLineComplete && input.exactNodeHasChildren === false,
  );
}
