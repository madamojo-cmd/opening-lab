import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

export function KnightRouteBoard({
  fen,
  orientation = "white",
  disabled = false,
  onMoveAttempt,
}: {
  fen: string;
  orientation?: "white" | "black";
  disabled?: boolean;
  onMoveAttempt: (attempt: DailyBlundrBoardMoveAttempt) => void;
}) {
  return (
    <div
      aria-label="Knight route board"
      className="mt-3 rounded-[1.75rem] bg-stone-950 p-3 shadow-[0_22px_55px_rgba(20,17,12,0.24)]"
    >
      <DailyBlundrBoard
        fen={fen}
        disabled={disabled}
        onSquareClick={() => undefined}
        onMoveAttempt={onMoveAttempt}
        openingColor={orientation}
        forcedOrientation={orientation}
        boardVisuals={null}
        squareStyles={{}}
        animationClassName={null}
      />
    </div>
  );
}
