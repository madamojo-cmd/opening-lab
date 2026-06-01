import type { StrategicPlanPacket } from "./planTypes";

export function summarizePlanDebug(packet: StrategicPlanPacket): Record<string, unknown> {
  return {
    normalizedFen: packet.normalizedFen,
    plans: packet.plans.map((plan) => ({ id: plan.id, type: plan.type, confidence: plan.confidence })),
    blockedPlans: packet.blockedPlans,
    timings: packet.timings,
  };
}
