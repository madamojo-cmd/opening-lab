/**
 * plainLeakDetector.ts
 * v2.7.42 - Detects forbidden leaks in Plain View before Show More.
 */

export interface PlainLeakInput {
  displayMode: "assisted" | "plain";
  showMoreClicked: boolean;
  coachText: string;           // combined title + body
  hintText?: string | null;
  visualIntents: any[];        // simplified for now
}

export interface PlainLeakResult {
  hasLeak: boolean;
  leaks: string[];
}

const FORBIDDEN_PATTERNS = [
  /\b[a-h][1-8][a-h][1-8]\b/,           // UCI
  /\b[a-h][1-8]\b/,                     // square
  /\b(Play|Nf3|Bc4|e4|O-O|Re1|Bb5|c4|d4)\b/i, // common SANs - in real system this would be dynamic
  /answer_move|visual_recipe|candidate_move/i,
];

export function detectPlainLeaks(input: PlainLeakInput): PlainLeakResult {
  const leaks: string[] = [];

  if (input.displayMode !== "plain" || input.showMoreClicked) {
    return { hasLeak: false, leaks: [] };
  }

  const textToCheck = (input.coachText || "") + " " + (input.hintText || "");

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(textToCheck)) {
      leaks.push(`plain_leak_detected:${pattern.source}`);
    }
  }

  // Visual leak check (simplified)
  if (input.visualIntents && input.visualIntents.length > 0) {
    leaks.push("plain_visual_leak:answer_arrow_or_highlight_present");
  }

  return {
    hasLeak: leaks.length > 0,
    leaks,
  };
}
