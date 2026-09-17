import type { ReviewMarketingBoardProps } from "../../blundr-training-demo-package";
import { ProductionChessBoard } from "./ProductionBoardBridge";
export function SmartReviewBoardAdapter(props: ReviewMarketingBoardProps) { return <ProductionChessBoard {...props} />; }
