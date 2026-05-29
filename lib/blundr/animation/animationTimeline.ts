import type { VisualBeat, VisualRecipe } from "../visualRecipe/visualRecipeTypes";

export type BeatTimelineEntry = {
  beatIndex: number;
  beatId: string;
  startsAtMs: number;
  endsAtMs: number;
  beat: VisualBeat;
};

function beatDuration(beat: VisualBeat): number {
  const profileDuration = beat.timingProfile?.totalMs ?? 0;
  if (profileDuration > 0) return profileDuration;
  return Math.max(0, beat.durationMs);
}

export function buildAnimationTimeline(recipe: VisualRecipe, startsAtMs: number): BeatTimelineEntry[] {
  let cursor = startsAtMs;
  return recipe.beats
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((beat, beatIndex) => {
      const delay = Math.max(0, beat.delayMs ?? 0);
      const start = cursor + delay;
      const duration = beatDuration(beat);
      const end = start + duration;
      cursor = end;
      return {
        beatIndex,
        beatId: beat.id,
        startsAtMs: start,
        endsAtMs: end,
        beat,
      };
    });
}

export function getActiveBeatEntry(timeline: BeatTimelineEntry[], nowMs: number): BeatTimelineEntry | null {
  for (const entry of timeline) {
    if (nowMs >= entry.startsAtMs && nowMs < entry.endsAtMs) return entry;
  }
  return null;
}

export function getLastBeatEntry(timeline: BeatTimelineEntry[]): BeatTimelineEntry | null {
  return timeline.length ? timeline[timeline.length - 1] : null;
}
