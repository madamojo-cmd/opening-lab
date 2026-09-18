import type { MarketingBoardProps } from "../../blundr-training-demo-package";
import { ProductionChessBoard } from "./ProductionBoardBridge";
export function BlundrMarketingBoardAdapter(props: MarketingBoardProps) { return <ProductionChessBoard {...props} presentation="bare" />; }
