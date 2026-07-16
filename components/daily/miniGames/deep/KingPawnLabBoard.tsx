import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

export function KingPawnLabBoard({ fen, orientation = "white", disabled = false, onMoveAttempt }: { fen: string; orientation?: "white" | "black"; disabled?: boolean; onMoveAttempt: (attempt: DailyBlundrBoardMoveAttempt) => void }) {
  return (
    <div aria-label="King and pawn board" className="mt-3 rounded-2xl bg-stone-50 p-2">
      <DailyBlundrBoard fen={fen} disabled={disabled} onSquareClick={() => undefined} onMoveAttempt={onMoveAttempt} openingColor={orientation} forcedOrientation={orientation} boardVisuals={null} squareStyles={{}} animationClassName={null} />
    </div>
  );
}
