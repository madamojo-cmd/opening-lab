import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { SurfaceAction, TeachingSurfaceMode } from "./types";

function action(input: {
  kind: SurfaceAction["kind"];
  label: string;
  targetUci: string | null;
  targetSan: string | null;
  enabled?: boolean;
  visible?: boolean;
}): SurfaceAction {
  return {
    kind: input.kind,
    label: input.label,
    targetUci: input.targetUci,
    targetSan: input.targetSan,
    enabled: input.enabled ?? true,
    visible: input.visible ?? true,
  };
}

export function buildSurfaceActions(input: {
  mode: TeachingSurfaceMode;
  safeFrame: CompiledCoachFrame;
}): SurfaceAction[] {
  const { mode, safeFrame } = input;

  if (mode === "plain_before_show_more") {
    return [
      action({
        kind: "hint",
        label: "Hint",
        targetUci: null,
        targetSan: null,
      }),
      action({
        kind: "show_more",
        label: "Show more",
        targetUci: null,
        targetSan: null,
      }),
    ];
  }

  if (mode === "branch_complete") {
    if (safeFrame.revealAction.kind === "continue_from_here") {
      return [
        action({
          kind: "continue_from_here",
          label: safeFrame.revealAction.label || "Continue from Here",
          targetUci: null,
          targetSan: null,
        }),
        action({
          kind: "restart_line",
          label: "Restart line",
          targetUci: null,
          targetSan: null,
        }),
      ];
    }
    return [];
  }

  if (mode === "assisted") {
    return [];
  }

  if (mode === "terminal") {
    return [
      action({
        kind: "restart_line",
        label: "Restart line",
        targetUci: null,
        targetSan: null,
      }),
    ];
  }

  if (mode === "continuation_analyzing") {
    return [];
  }

  if (mode === "plain_after_show_more") {
    const actions: SurfaceAction[] = [
      action({
        kind: "hide_more",
        label: "Hide more",
        targetUci: null,
        targetSan: null,
      }),
    ];

    return actions;
  }

  return [];
}
