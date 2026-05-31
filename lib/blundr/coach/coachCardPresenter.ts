import type { CoachButton, CoachDecision } from "./coachTypes";

export type CoachCardViewModel = {
  title: string;
  body: string;
  why?: string;
  buttons: CoachButton[];
};

export function presentCoachCard(decision: CoachDecision): CoachCardViewModel | null {
  if (!decision.shouldShowCoachCard) return null;
  return {
    title: decision.title ?? "Blundr Coach",
    body: decision.body ?? decision.hint ?? decision.answer ?? "",
    why: decision.why,
    buttons: decision.buttons,
  };
}
