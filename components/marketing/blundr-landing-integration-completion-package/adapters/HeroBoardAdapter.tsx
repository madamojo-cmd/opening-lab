import { ProductionChessBoard } from "./ProductionBoardBridge";
export type HeroBoardAdapterProps = { targetSquare: string; reducedMotion: boolean };
export const HERO_FEN = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
export function HeroBoardAdapter({ targetSquare, reducedMotion }: HeroBoardAdapterProps) { return <ProductionChessBoard fen={HERO_FEN} orientation="white" arrows={[]} highlightedSquares={[targetSquare]} highlightColor="blue" emphasizedSquare={targetSquare} lastMove={null} interactive={false} animationDurationMs={reducedMotion ? 0 : 420} />; }
