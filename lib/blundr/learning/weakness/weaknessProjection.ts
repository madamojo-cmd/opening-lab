import type {
  LearningFinding,
  WeaknessProjection,
} from "@/lib/blundr/contracts";
import { calculateWeaknessConfidence } from "./weaknessConfidence";
import { calculateWeaknessScore } from "./weaknessScore";
import type { WeaknessProjectionInput } from "./weaknessTypes";

export function projectWeaknesses(
  input: WeaknessProjectionInput,
): WeaknessProjection[] {
  const grouped = new Map<string, LearningFinding[]>();
  for (const finding of input.findings) {
    const access = input.accessByPosition.get(finding.position.positionKey);
    if (!access || access.decision !== "active") continue;
    const key = `${finding.position.positionKey}:${finding.category}`;
    grouped.set(key, [...(grouped.get(key) ?? []), finding]);
  }
  return [...grouped.entries()]
    .map(([key, findings]) => {
      const latest = [...findings].sort((a, b) =>
        b.source.observedAt.localeCompare(a.source.observedAt),
      )[0];
      const confidence = calculateWeaknessConfidence({
        independentMisses: findings.length,
        ambiguousEvidence: findings.filter(
          (finding) => finding.source.source === "imported_game",
        ).length,
        sourceCount: new Set(findings.map((finding) => finding.source.sourceId))
          .size,
      });
      const score = calculateWeaknessScore({
        confidence,
        severity: latest.severity,
        recencyDays: 0,
        masteryConfidence: 0,
      });
      return {
        positionKey: latest.position.positionKey,
        category: latest.category,
        score,
        confidence,
        explanation: latest.explanation,
        recommendedDailyIntervention: latest.recommendedDailyIntervention,
        access: "active" as const,
      };
    })
    .sort(
      (a, b) => b.score - a.score || a.positionKey.localeCompare(b.positionKey),
    );
}
