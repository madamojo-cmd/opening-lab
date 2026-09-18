import { Chess } from "chess.js";
import {
  createPositionIdentity,
  type IdentityInput,
  type PositionIdentity,
} from "@/lib/blundr/contracts";
import { canonicalPositionFen } from "@/lib/blundr/chess/canonicalPosition";

export { createPositionIdentity };
export type { IdentityInput, PositionIdentity };

export function canonicalizeFen(fen: string): string {
  return canonicalPositionFen(new Chess(fen).fen());
}

export function createValidatedPositionIdentity(
  input: IdentityInput,
): PositionIdentity {
  return createPositionIdentity({
    ...input,
    canonicalFen: canonicalizeFen(input.canonicalFen),
  });
}
