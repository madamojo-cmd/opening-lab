import { ProductionChessBoard } from "./ProductionBoardBridge";
export type HeroBoardAdapterProps = { targetSquare: string; reducedMotion: boolean };
export const HERO_FEN = "4k3/8/8/8/8/8/8/4K3 w - - 0 1";
export function HeroBoardAdapter({ targetSquare, reducedMotion }: HeroBoardAdapterProps) {
  return (
    <ProductionChessBoard
      fen={HERO_FEN}
      orientation="white"
      arrows={[]}
      highlightedSquares={[targetSquare]}
      highlightColor="amber"
      emphasizedSquare={null}
      lastMove={null}
      interactive={false}
      animationDurationMs={reducedMotion ? 0 : 420}
    />
  );
}
