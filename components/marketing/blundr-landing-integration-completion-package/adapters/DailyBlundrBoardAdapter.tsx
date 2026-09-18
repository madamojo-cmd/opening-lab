import type { DailyMarketingBoardProps } from "../../blundr-training-demo-package";
import { ProductionChessBoard } from "./ProductionBoardBridge";
export function DailyBlundrBoardAdapter(props: DailyMarketingBoardProps) { return <ProductionChessBoard {...props} presentation="bare" />; }
