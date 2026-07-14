import type { PositionIdentity } from "@/lib/blundr/contracts";
import type { OpeningAccessRepository } from "./openingAccessTypes";

export function canUsePosition(input: {
  userId: string;
  position: PositionIdentity;
  side: "white" | "black";
  access: OpeningAccessRepository;
}): boolean {
  if (!input.position.openingId) return false;
  const result = input.access.get({
    userId: input.userId,
    openingId: input.position.openingId,
    repertoireSide: input.side,
  });
  return result.decision === "active";
}
