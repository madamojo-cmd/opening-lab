import type { LegalRoute } from "./transpositionActivityTypes";
export function selectAlternateRoute(
  routes: readonly LegalRoute[],
  standard: LegalRoute,
): LegalRoute | null {
  return (
    routes.find(
      (route) =>
        route.moves.join(",") !== standard.moves.join(",") &&
        route.finalFen.split(" ").slice(0, 4).join(" ") ===
          standard.finalFen.split(" ").slice(0, 4).join(" "),
    ) ?? null
  );
}
