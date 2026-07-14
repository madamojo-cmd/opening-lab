export type ReplyGate = { reply: string; index: number };
export function nextVerifiedReply(
  replies: readonly string[],
  userMoveCount: number,
): ReplyGate | null {
  const reply = replies[userMoveCount];
  return reply ? { reply, index: userMoveCount } : null;
}
