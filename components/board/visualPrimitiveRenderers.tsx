import type { VisualPrimitive } from "@/lib/blundr/visualRecipe/visualRecipeTypes";

export type TeachingOverlayLine = {
  from: string;
  to: string;
  kind: "attack" | "defense" | "plan" | "opponent";
  label?: string;
};

export type TeachingOverlaySquare = {
  square: string;
  kind: "origin" | "target" | "support" | "danger" | "opponent";
  role?: string;
};

function validSquare(square?: string): square is string {
  return Boolean(square && /^[a-h][1-8]$/.test(square));
}

export function primitiveToTeachingLine(primitive: VisualPrimitive): TeachingOverlayLine | null {
  if (primitive.lane !== "persistent_teaching") return null;
  if (primitive.type === "move_arrow" && validSquare(primitive.from) && validSquare(primitive.to)) {
    return { from: primitive.from, to: primitive.to, kind: "plan", label: primitive.purpose };
  }
  if (primitive.type === "pressure_line" && validSquare(primitive.from) && validSquare(primitive.to)) {
    return { from: primitive.from, to: primitive.to, kind: "attack", label: primitive.purpose };
  }
  return null;
}

export function primitiveToTeachingSquare(primitive: VisualPrimitive): TeachingOverlaySquare | null {
  if (primitive.lane !== "persistent_teaching") return null;
  if (primitive.type === "target_ring" && validSquare(primitive.square)) return { square: primitive.square, kind: "target", role: primitive.effectFamily };
  if (primitive.type === "square_highlight" && validSquare(primitive.square)) {
    const role = primitive.role ?? "context";
    if (role === "danger") return { square: primitive.square, kind: "danger", role };
    if (role === "safe" || role === "support") return { square: primitive.square, kind: "support", role };
    return { square: primitive.square, kind: "target", role };
  }
  if (primitive.type === "ghost_piece" && validSquare(primitive.square)) return { square: primitive.square, kind: "support", role: "ghost_piece" };
  if (primitive.type === "king_safety_aura" && validSquare(primitive.square)) return { square: primitive.square, kind: "support", role: "king_safety" };
  return null;
}

export function primitivesToTeachingOverlay(primitives: VisualPrimitive[]): {
  lines: TeachingOverlayLine[];
  squares: TeachingOverlaySquare[];
  primitiveIds: string[];
} {
  const lines = primitives.map(primitiveToTeachingLine).filter((line): line is TeachingOverlayLine => Boolean(line));
  const squares = primitives.map(primitiveToTeachingSquare).filter((square): square is TeachingOverlaySquare => Boolean(square));
  return {
    lines,
    squares,
    primitiveIds: primitives.map((primitive) => primitive.id),
  };
}
