import type { MasteryStatus } from "./masteryMapTypes";

const precedence: readonly MasteryStatus[] = [
  "repeated_lapse",
  "weak",
  "due",
  "learning",
  "mastered",
  "unseen",
];

export function resolveMasteryStatus(input: {
  repeatedLapse?: boolean;
  weak?: boolean;
  due?: boolean;
  learning?: boolean;
  mastered?: boolean;
}): MasteryStatus {
  const flags: Record<MasteryStatus, boolean> = {
    repeated_lapse: Boolean(input.repeatedLapse),
    weak: Boolean(input.weak),
    due: Boolean(input.due),
    learning: Boolean(input.learning),
    mastered: Boolean(input.mastered),
    unseen: true,
  };
  return precedence.find((status) => flags[status]) ?? "unseen";
}
