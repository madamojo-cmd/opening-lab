import type { CoachTemplateSlots } from "./types";

function fill(template: string, slots: CoachTemplateSlots): string {
  const values: Record<string, string> = {
    targetUci: slots.targetUci ?? "",
    targetSan: slots.targetSan ?? "",
    pieceType: slots.pieceType ?? "",
    pieceLabel: slots.pieceLabel ?? "",
    from: slots.from ?? "",
    to: slots.to ?? "",
    moveVerb: slots.moveVerb,
    conceptLabel: slots.conceptLabels[0] ?? "improvement",
    evidenceSummary: slots.evidenceSummaries[0] ?? "board evidence",
    openingName: slots.openingName ?? "",
    lineName: slots.lineName ?? "",
  };

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => values[key] ?? "").replace(/\s+/g, " ").trim();
}

export function stripUnsafePlainLeaks(input: {
  text: string;
  slots: CoachTemplateSlots;
}): string {
  let out = String(input.text);
  const bans = [
    input.slots.targetSan,
    input.slots.targetUci,
    input.slots.from,
    input.slots.to,
    input.slots.pieceType,
    input.slots.pieceLabel,
  ]
    .map((token) => String(token ?? "").trim())
    .filter((token) => token.length > 0);

  for (const token of bans) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "gi"), "");
  }

  out = out
    .replace(/\b(from|to)\s+[a-h][1-8]\b/gi, "")
    .replace(/\b[a-h][1-8][a-h][1-8][qrbn]?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!out) {
    return "Look for the move that improves your position without revealing the answer.";
  }

  return out;
}

export function renderTemplate(input: {
  template: string;
  slots: CoachTemplateSlots;
  mode: "plain" | "assisted" | "show_more";
}): string {
  const rendered = fill(input.template, input.slots);
  if (input.mode === "plain") {
    return stripUnsafePlainLeaks({ text: rendered, slots: input.slots });
  }
  return rendered;
}
