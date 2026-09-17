"use client";

import { BlundrMarketingRoot } from "../shared/BlundrMarketingRoot";
import { BlundrMarketingHeaderCompletion } from "../header/BlundrMarketingHeaderCompletion";
import { HeroVisualCompletion } from "../hero/HeroVisualCompletion";
import { HeroBoardAdapter } from "../adapters/HeroBoardAdapter";
import { BlundrMarketingBoardAdapter } from "../adapters/BlundrMarketingBoardAdapter";
import { DailyBlundrBoardAdapter } from "../adapters/DailyBlundrBoardAdapter";
import { SmartReviewBoardAdapter } from "../adapters/SmartReviewBoardAdapter";
import { MarketingTrainingDemo,DailyBlundrMarketingDemo,SmartReviewMarketingDemo,MasteryMarketingDemo,DailyRingsMarketingDemo } from "../../blundr-training-demo-package";
import { MomentumSectionCorrected } from "../momentum/MomentumSectionCorrected";
import { PricingSectionCorrected } from "../pricing/PricingSectionCorrected";
import { FinalCTACompletion } from "./FinalCTACompletion";
import { BlundrMarketingFooterCompletion } from "../footer/BlundrMarketingFooterCompletion";
export function FinalLandingPageComposition({tempoImageSrc="/brand/tempo-transparent.png"}:{tempoImageSrc?:string}){return <BlundrMarketingRoot><BlundrMarketingHeaderCompletion tempoImageSrc={tempoImageSrc}/><HeroVisualCompletion Board={HeroBoardAdapter} tempoImageSrc={tempoImageSrc}/><main><MarketingTrainingDemo Board={BlundrMarketingBoardAdapter} tempoImageSrc={tempoImageSrc}/><DailyBlundrMarketingDemo Board={DailyBlundrBoardAdapter}/><SmartReviewMarketingDemo Board={SmartReviewBoardAdapter}/><MasteryMarketingDemo tempoImageSrc={tempoImageSrc}/><DailyRingsMarketingDemo/><MomentumSectionCorrected tempoImageSrc={tempoImageSrc}/><PricingSectionCorrected/><FinalCTACompletion/></main><BlundrMarketingFooterCompletion tempoImageSrc={tempoImageSrc}/></BlundrMarketingRoot>}
