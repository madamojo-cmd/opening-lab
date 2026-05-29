function cleanToken(value?: string): string {
  if (!value) return "none";
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "none";
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash >>> 0) * 0x01000193;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildPatternId(input: {
  openingId?: string;
  lineId?: string;
  conceptId?: string;
  moveUci?: string;
  fen: string;
}): string {
  const openingKey = cleanToken(input.openingId ?? "opening");
  const conceptKey = cleanToken(input.conceptId ?? "context_only");
  const moveKey = cleanToken(input.moveUci ?? "none");
  const fenKey = fnv1a32(input.fen.trim());
  const lineKey = cleanToken(input.lineId ?? "line");
  return `${openingKey}:${lineKey}:${conceptKey}:${moveKey}:${fenKey}`;
}

export function buildVisualRecipeId(input: {
  schemaVersion: number;
  openingId?: string;
  lineId?: string;
  conceptId?: string;
  moveUci?: string;
  mode: string;
  fen: string;
}): string {
  const openingKey = cleanToken(input.openingId ?? "opening");
  const lineKey = cleanToken(input.lineId ?? "line");
  const conceptKey = cleanToken(input.conceptId ?? "context_only");
  const moveKey = cleanToken(input.moveUci ?? "none");
  const modeKey = cleanToken(input.mode);
  const hash = fnv1a32(`${input.fen}|${openingKey}|${lineKey}|${conceptKey}|${moveKey}|${modeKey}|v${input.schemaVersion}`);
  return `vr:v${input.schemaVersion}:${openingKey}:${conceptKey}:${moveKey}:${modeKey}:${hash}`;
}

export function buildVisualPrimitiveId(input: {
  visualRecipeId: string;
  beatOrder: number;
  type: string;
  from?: string;
  to?: string;
  square?: string;
  purpose?: string;
}): string {
  const detail = [
    input.type,
    cleanToken(input.from),
    cleanToken(input.to),
    cleanToken(input.square),
    cleanToken(input.purpose),
  ].join(":");
  return `${input.visualRecipeId}:b${input.beatOrder}:${detail}`;
}

export function buildVisualBeatId(visualRecipeId: string, beatOrder: number, tag?: string): string {
  return `${visualRecipeId}:beat:${beatOrder}:${cleanToken(tag ?? "beat")}`;
}
