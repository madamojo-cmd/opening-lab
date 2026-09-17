export type MasteryMarketingFrame = {
  progress: number;
  mastered: number;
  learning: number;
  weak: number;
  unseen: number;
  accuracy: number;
};

export const masteryMarketingFrames: readonly MasteryMarketingFrame[] = [
  { progress: 0, mastered: 0, learning: 5, weak: 14, unseen: 1140, accuracy: 86 },
  { progress: 8, mastered: 4, learning: 12, weak: 11, unseen: 1124, accuracy: 88 },
  { progress: 17, mastered: 11, learning: 19, weak: 7, unseen: 1101, accuracy: 91 },
  { progress: 26, mastered: 18, learning: 27, weak: 3, unseen: 1078, accuracy: 94 },
] as const;
