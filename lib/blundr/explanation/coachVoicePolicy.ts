export function normalizeCoachVoice(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function isPolishedCoachCopy(text: string): boolean {
  return !/verified_top2|Stockfish|maia|centipawn|engine delta|rule-only visual|GPT manual/i.test(text);
}
