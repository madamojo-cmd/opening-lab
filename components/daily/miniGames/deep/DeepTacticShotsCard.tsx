"use client";
import type { DeepMiniGamePublicState } from "@/lib/blundr/daily/miniGames/deep";
import { DeepTacticSequence } from "./DeepTacticSequence";
export function DeepTacticShotsCard({
  state,
}: {
  state: DeepMiniGamePublicState;
}) {
  return (
    <article className="rounded-3xl bg-[#f4f0e8] p-4">
      <h2 className="text-lg font-black">Deep Tactic Shots</h2>
      <p className="mt-2 text-sm">Find the verified sequence.</p>
      <DeepTacticSequence moves={state.moves} />
    </article>
  );
}
