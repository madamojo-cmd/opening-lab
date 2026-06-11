import { selectSampleStage2Copy } from "./selectSampleStage2Copy";
import type {
  SampleStage2CopyBundle,
  SampleStage2Packet,
  SampleStage2TargetContext,
  SampleStage2CrawlBundle,
} from "./sampleStage2Types";

type BuildInput = {
  crawlBundle: SampleStage2CrawlBundle;
  copyBundle: SampleStage2CopyBundle;
  targetContext: SampleStage2TargetContext;
};

function buildBasePacket(input: {
  targetContext: SampleStage2TargetContext;
  status: SampleStage2Packet["status"];
  blockers?: string[];
}): SampleStage2Packet {
  const { targetContext, status, blockers } = input;
  return {
    status,
    openingId: targetContext.openingId,
    nodeKey: targetContext.nodeKey,
    playKey: targetContext.playKey,
    moveUci: targetContext.moveUci,
    sampleOnly: true,
    source: "stage2_sample_colle",
    ...(blockers && blockers.length > 0 ? { blockers } : {}),
  };
}

function normalizeMode(targetContext: SampleStage2TargetContext): "assisted" | "plain" {
  return targetContext.mode === "plain" ? "plain" : "assisted";
}

export function buildSampleStage2Packet(input: BuildInput): SampleStage2Packet {
  const { crawlBundle, copyBundle, targetContext } = input;

  if (!crawlBundle.openingIds.includes(targetContext.openingId)) {
    return buildBasePacket({
      targetContext,
      status: "no_match",
      blockers: ["opening_not_in_sample_crawl"],
    });
  }

  const nodesForOpening = crawlBundle.nodes.filter((node) => node.openingId === targetContext.openingId);
  const candidatesForOpening = crawlBundle.candidateMoves.filter((move) => move.openingId === targetContext.openingId);

  let resolvedNode = targetContext.nodeKey
    ? nodesForOpening.find((node) => node.nodeKey === targetContext.nodeKey)
    : undefined;

  if (targetContext.nodeKey && !resolvedNode) {
    return buildBasePacket({
      targetContext,
      status: "blocked",
      blockers: ["node_not_in_sample_crawl"],
    });
  }

  if (!resolvedNode && targetContext.playKey) {
    resolvedNode = nodesForOpening.find((node) => node.playKey === targetContext.playKey);
  }

  if (!resolvedNode) {
    return buildBasePacket({
      targetContext,
      status: "no_match",
      blockers: ["no_target_node_context"],
    });
  }

  const matchingCandidate = candidatesForOpening.find((move) => {
    if (move.nodeKey !== resolvedNode.nodeKey) return false;
    return move.moveUci === targetContext.moveUci;
  });

  if (!matchingCandidate) {
    return buildBasePacket({
      targetContext,
      status: "blocked",
      blockers: ["target_move_not_in_node_candidates"],
    });
  }

  const selectedCopy = selectSampleStage2Copy({ copyBundle, targetContext: { ...targetContext, nodeKey: resolvedNode.nodeKey, playKey: resolvedNode.playKey } });

  if (!selectedCopy) {
    return buildBasePacket({
      targetContext: { ...targetContext, nodeKey: resolvedNode.nodeKey, playKey: resolvedNode.playKey ?? targetContext.playKey },
      status: "no_match",
      blockers: ["no_safe_copy_match"],
    });
  }

  const mode = normalizeMode(targetContext);
  const showMore = Boolean(targetContext.showMoreRevealed);

  const packet = buildBasePacket({
    targetContext: {
      ...targetContext,
      nodeKey: resolvedNode.nodeKey,
      playKey: resolvedNode.playKey ?? targetContext.playKey,
    },
    status: "matched",
  });

  packet.conceptId = selectedCopy.conceptId;
  if (Array.isArray(selectedCopy.visualRecipeRefs)) {
    packet.visualRecipeRefs = [...selectedCopy.visualRecipeRefs];
  }

  if (mode === "assisted" || showMore) {
    packet.copy = {
      entryId: selectedCopy.entryId,
      title: selectedCopy.title,
      body: selectedCopy.body,
      hint: selectedCopy.hint,
      difficulty: selectedCopy.difficulty,
      surface: selectedCopy.surface,
    };
    return packet;
  }

  const safeHintOnly = selectedCopy.hint && selectedCopy.hint.trim().length > 0
    ? {
        entryId: selectedCopy.entryId,
        hint: selectedCopy.hint,
        difficulty: selectedCopy.difficulty,
        surface: selectedCopy.surface,
      }
    : undefined;

  if (safeHintOnly) {
    packet.copy = safeHintOnly;
  }
  packet.blockers = ["plain_view_copy_hidden_until_show_more"];
  return packet;
}
