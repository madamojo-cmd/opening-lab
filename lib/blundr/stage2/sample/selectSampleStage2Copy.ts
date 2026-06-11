import type {
  SampleStage2CopyBundle,
  SampleStage2CopyEntry,
  SampleStage2TargetContext,
} from "./sampleStage2Types";

type SelectInput = {
  copyBundle: SampleStage2CopyBundle;
  targetContext: SampleStage2TargetContext;
};

function isApproved(entry: SampleStage2CopyEntry): boolean {
  return (entry.status ?? "draft") === "approved";
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function selectSampleStage2Copy(input: SelectInput): SampleStage2CopyEntry | null {
  const { copyBundle, targetContext } = input;

  const approved = copyBundle.entries.filter((entry) => {
    if (!isApproved(entry)) return false;
    if (!isNonEmpty(entry.openingId) || !isNonEmpty(entry.moveUci)) return false;
    if (entry.openingId !== targetContext.openingId) return false;
    if (entry.moveUci !== targetContext.moveUci) return false;
    return true;
  });

  const nodeMoveMatch = approved.find((entry) => {
    if (!isNonEmpty(targetContext.nodeKey)) return false;
    if (!isNonEmpty(entry.nodeKey)) return false;
    return entry.nodeKey === targetContext.nodeKey;
  });
  if (nodeMoveMatch) return nodeMoveMatch;

  const playMoveMatch = approved.find((entry) => {
    if (!isNonEmpty(targetContext.playKey)) return false;
    if (!isNonEmpty(entry.lineId)) return false;
    return entry.lineId === targetContext.playKey;
  });
  if (playMoveMatch) return playMoveMatch;

  return null;
}
