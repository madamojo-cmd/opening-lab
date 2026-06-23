import { buildStage2CoachContext } from "./buildStage2CoachContext";
import { resolveStage2CoachingPacket } from "./resolveStage2CoachingPacket";
import type { Stage2CoachContext, Stage2CoachingPacketEntry } from "./stage2CoachingTypes";

export type Stage2CoachingAuthorityKind =
  | "approved_packet"
  | "generated_feature_copy"
  | "safe_fallback";

export type Stage2CoachingAuthority = {
  kind: Stage2CoachingAuthorityKind;
  packetId: string | null;
  fallbackReason: string | null;
  sourceBundle: string | null;
  packet: Stage2CoachingPacketEntry | null;
};

export type ResolveStage2CoachingContentForMoveResult = {
  coachingAuthority: Stage2CoachingAuthority;
  stage2CoachContext: Stage2CoachContext;
  stage2CoachingPacketResolution: ReturnType<typeof resolveStage2CoachingPacket>;
};

export function resolveStage2CoachingContentForMove(
  input: Stage2CoachContext,
): ResolveStage2CoachingContentForMoveResult {
  const stage2CoachContext = buildStage2CoachContext(input);
  const stage2CoachingPacketResolution = resolveStage2CoachingPacket(stage2CoachContext);
  const coachingAuthority: Stage2CoachingAuthority =
    stage2CoachingPacketResolution.kind === "approved_packet"
      ? {
          kind: "approved_packet",
          packetId: stage2CoachingPacketResolution.packet.packetId ?? null,
          fallbackReason: null,
          sourceBundle: stage2CoachingPacketResolution.packet.sourceCandidatePackages?.[0] ?? stage2CoachingPacketResolution.packet.sourceCandidatePackage ?? null,
          packet: stage2CoachingPacketResolution.packet,
        }
      : stage2CoachingPacketResolution.kind === "safe_fallback"
        ? {
            kind: "safe_fallback",
            packetId: stage2CoachingPacketResolution.packet.packetId ?? null,
            fallbackReason: "safe_fallback_applied",
            sourceBundle: stage2CoachingPacketResolution.packet.sourceCandidatePackages?.[0] ?? stage2CoachingPacketResolution.packet.sourceCandidatePackage ?? null,
            packet: stage2CoachingPacketResolution.packet,
          }
        : {
            kind: "generated_feature_copy",
            packetId: null,
            fallbackReason: stage2CoachingPacketResolution.reason ?? "generated_feature_copy",
            sourceBundle: null,
            packet: null,
          };

  return {
    coachingAuthority,
    stage2CoachContext,
    stage2CoachingPacketResolution,
  };
}
