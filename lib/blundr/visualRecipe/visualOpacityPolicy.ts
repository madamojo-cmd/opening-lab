export interface VisualOpacityPolicy {
  defaultOpacity: number;
  hoverOpacity: number;
  dragOpacity: number;
  pieceLiftOpacity: number;
  moveLandingOpacity: number;
  suppressedOpacity: number;
}

export type VisualInteractionState =
  | "default"
  | "hover"
  | "drag"
  | "piece_lift"
  | "move_landing"
  | "suppressed";

export const DEFAULT_VISUAL_OPACITY_POLICY: VisualOpacityPolicy = {
  defaultOpacity: 1,
  hoverOpacity: 0.1,
  dragOpacity: 0.1,
  pieceLiftOpacity: 0.1,
  moveLandingOpacity: 1,
  suppressedOpacity: 0,
};

export function opacityForInteraction(policy: VisualOpacityPolicy, state: VisualInteractionState): number {
  if (state === "hover") return policy.hoverOpacity;
  if (state === "drag") return policy.dragOpacity;
  if (state === "piece_lift") return policy.pieceLiftOpacity;
  if (state === "move_landing") return policy.moveLandingOpacity;
  if (state === "suppressed") return policy.suppressedOpacity;
  return policy.defaultOpacity;
}
