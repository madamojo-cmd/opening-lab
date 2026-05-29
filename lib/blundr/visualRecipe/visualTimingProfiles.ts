export interface VisualTimingProfile {
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
  totalMs: number;
  persistent: boolean;
}

export const TRANSIENT_TACTICAL_TIMING: VisualTimingProfile = {
  fadeInMs: 100,
  holdMs: 700,
  fadeOutMs: 200,
  totalMs: 1000,
  persistent: false,
};

export const PERSISTENT_TEACHING_TIMING: VisualTimingProfile = {
  fadeInMs: 100,
  holdMs: 0,
  fadeOutMs: 100,
  totalMs: 0,
  persistent: true,
};

export function timingForLane(lane: string): VisualTimingProfile {
  if (lane === "transient_tactical_effect") return TRANSIENT_TACTICAL_TIMING;
  return PERSISTENT_TEACHING_TIMING;
}
