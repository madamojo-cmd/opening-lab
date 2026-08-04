function finiteOrZero(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatRounded(value: number, fractionDigits: number): string {
  const scale = 10 ** fractionDigits;
  const rounded = Math.round((value + Number.EPSILON) * scale) / scale;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(fractionDigits);
}

export function formatRepertoirePoints(value: unknown): string {
  return formatRounded(Math.max(0, finiteOrZero(value)), 1);
}

export function clampProgressPercentage(value: unknown): number {
  return Math.max(0, Math.min(100, finiteOrZero(value)));
}

export function formatProgressPercentage(value: unknown): string {
  return `${formatRounded(clampProgressPercentage(value), 1)}%`;
}
