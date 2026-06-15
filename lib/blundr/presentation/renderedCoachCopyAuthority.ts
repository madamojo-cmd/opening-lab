export type CoachCopyCandidate = {
  title: string;
  body: string;
  bullets?: string[];
};

type SelectionInput = {
  trainerPhase: string;
  isUserTurn: boolean;
  visibleSurfaceMode: string | null | undefined;
  instructionTargetUci: string | null | undefined;
  surfaceSafetyBlocked: boolean;
  surfaceCopy: CoachCopyCandidate;
  pipelineCopy: CoachCopyCandidate;
  pipelineTargetAligned: boolean | null | undefined;
  pipelinePieceAligned: boolean | null | undefined;
  pipelineContainsDebugLeak: boolean;
  pipelinePassedSafety: boolean;
};

export type CoachCopyAuthorityDecision = {
  copy: CoachCopyCandidate;
  renderedCopyAuthority: "pipeline_coach_decision" | "visible_surface_v28";
  pipelineCopyAuthority: "displayedCoachDecision";
  pipelineCopyRejected: boolean;
  pipelineCopyRejectedReason: string | null;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function selectRenderedCoachCardCopyAuthority(input: SelectionInput): CoachCopyAuthorityDecision {
  const isInstructionalUserTurn =
    input.trainerPhase === "ready_for_user" &&
    input.isUserTurn === true &&
    hasText(input.instructionTargetUci);
  const pipelineHasCopy = hasText(input.pipelineCopy.title) && hasText(input.pipelineCopy.body);
  const pipelineTargetAligned = input.pipelineTargetAligned !== false;
  const pipelinePieceAligned = input.pipelinePieceAligned !== false;
  const surfaceMode = String(input.visibleSurfaceMode ?? "").trim();
  const plainPreShowMore = surfaceMode === "plain_before_show_more";

  const pipelineAllowed =
    isInstructionalUserTurn &&
    pipelineHasCopy &&
    pipelineTargetAligned &&
    pipelinePieceAligned &&
    !input.pipelineContainsDebugLeak &&
    input.pipelinePassedSafety &&
    !input.surfaceSafetyBlocked &&
    !plainPreShowMore;

  if (pipelineAllowed) {
    return {
      copy: {
        title: input.pipelineCopy.title,
        body: input.pipelineCopy.body,
        bullets: input.pipelineCopy.bullets ?? [],
      },
      renderedCopyAuthority: "pipeline_coach_decision",
      pipelineCopyAuthority: "displayedCoachDecision",
      pipelineCopyRejected: false,
      pipelineCopyRejectedReason: null,
    };
  }

  const rejectionReason = !isInstructionalUserTurn
    ? "not_instructional_user_turn"
    : !pipelineHasCopy
      ? "pipeline_copy_missing"
      : !pipelineTargetAligned
        ? "pipeline_target_misaligned"
        : !pipelinePieceAligned
          ? "pipeline_piece_misaligned"
          : input.pipelineContainsDebugLeak
            ? "pipeline_contains_debug_leak"
            : !input.pipelinePassedSafety
              ? "pipeline_safety_not_passed"
              : input.surfaceSafetyBlocked
                ? "surface_safety_blocked"
                : plainPreShowMore
                  ? "plain_pre_show_more"
                  : "pipeline_copy_not_applied";

  return {
    copy: {
      title: input.surfaceCopy.title,
      body: input.surfaceCopy.body,
      bullets: input.surfaceCopy.bullets ?? [],
    },
    renderedCopyAuthority: "visible_surface_v28",
    pipelineCopyAuthority: "displayedCoachDecision",
    pipelineCopyRejected: true,
    pipelineCopyRejectedReason: rejectionReason,
  };
}
