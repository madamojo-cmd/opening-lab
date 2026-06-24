import type { Stage2RuntimeBookIndex, Stage2RuntimeBookMove, Stage2RuntimeBookMoveQueryInput } from "./runtimeBookTypes";
import { normalizeRuntimePlayKey } from "../runtime/uciNormalization";

function keyFor(openingId: string, playKeyBefore: string): string {
  return `${openingId}::${playKeyBefore}`;
}

export function getRuntimeBookMoves(index: Stage2RuntimeBookIndex, query: Stage2RuntimeBookMoveQueryInput): Stage2RuntimeBookMove[] {
  const openingId = String(query.openingId ?? "");
  const playKeyBefore = normalizeRuntimePlayKey(query.playKeyBefore ?? "") ?? "";
  if (!openingId) return [];
  if (!playKeyBefore) return [];

  const found = index.moveIndexByOpeningAndPlayKeyBefore.get(keyFor(openingId, playKeyBefore));
  if (!found || found.length === 0) return [];
  return found.map((move) => ({ ...move }));
}
