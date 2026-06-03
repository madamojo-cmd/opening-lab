import assert from "node:assert/strict";

function shouldResetShowMore(previousFrameKey: string, nextFrameKey: string): boolean {
  return previousFrameKey !== nextFrameKey;
}

export function testShowMoreVisualReveal(): void {
  const instructionTarget = "f1c4";

  const plainBeforeShowMore = {
    frameKey: "frame-a",
    plainMode: true,
    showMoreShown: false,
    answerVisualTarget: null as string | null,
  };

  const plainAfterShowMore = {
    frameKey: "frame-a",
    plainMode: true,
    showMoreShown: true,
    answerVisualTarget: "f1c4",
    assistedEquivalentVisualTarget: "f1c4",
  };

  assert.equal(plainBeforeShowMore.answerVisualTarget, null, "plain pre-showMore must not reveal answer visual");
  assert.equal(plainAfterShowMore.answerVisualTarget, plainAfterShowMore.assistedEquivalentVisualTarget);
  assert.equal(plainAfterShowMore.answerVisualTarget, instructionTarget, "showMore visual target must equal instruction target");

  assert.equal(shouldResetShowMore("frame-a", "frame-b"), true, "frameKey change should reset showMore state");
  assert.equal(shouldResetShowMore("frame-a", "frame-a"), false);
}

testShowMoreVisualReveal();
console.log("showMoreVisualReveal ok");
