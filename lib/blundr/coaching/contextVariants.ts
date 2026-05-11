import type { BlundrContext } from "../featurePacketBuilder";

export type ExplanationMode =
  | "first_time"
  | "repeat"
  | "missed_recently"
  | "mastered"
  | "quiz"
  | "continuation";

export type ContextVariantInput = {
  base: BlundrContext;
  concept?: string;
  selectedMove?: string;
  trainingPhase?: string;
  userRatingBucket?: string;
  explanationMode: ExplanationMode;
};

function conceptText(concept?: string): string {
  return concept ? concept.replaceAll("_", " ") : "this idea";
}

export function renderContextVariant(input: ContextVariantInput): BlundrContext {
  const concept = conceptText(input.concept ?? input.base.concept);
  const move = input.selectedMove ?? input.base.selectedMove ?? "the highlighted move";
  const baseNext = input.base.next || `Play ${move}.`;

  if (input.explanationMode === "quiz") {
    return {
      ...input.base,
      body: `${input.base.body} Before moving, name the square this cue is trying to improve.`,
      next: baseNext,
      checkQuestion: `What is the main purpose of ${move}: ${concept}, safety, or central control?`,
      explanationMode: "quiz",
    };
  }

  if (input.explanationMode === "missed_recently") {
    return {
      ...input.base,
      body: `${input.base.body} This idea was missed recently, so focus on the verified cue before choosing.`,
      next: baseNext,
      explanationMode: "missed_recently",
    };
  }

  if (input.explanationMode === "mastered") {
    return {
      ...input.base,
      body: `${input.base.body} You have handled this pattern well, so use the visual cue as a quick confirmation.`,
      next: baseNext,
      explanationMode: "mastered",
    };
  }

  if (input.explanationMode === "continuation") {
    return {
      ...input.base,
      body: `${input.base.body} In continuation mode, this is a verified local candidate rather than a random legal fallback.`,
      next: baseNext,
      explanationMode: "continuation",
    };
  }

  if (input.explanationMode === "repeat") {
    return {
      ...input.base,
      body: `${input.base.body} Same concept, fresh wording: look for the highlighted destination and the follow-up pressure cue.`,
      next: baseNext,
      explanationMode: "repeat",
    };
  }

  return {
    ...input.base,
    body: `${input.base.body} First time seeing this cue here: connect the highlighted move with ${concept}.`,
    next: baseNext,
    explanationMode: "first_time",
  };
}
