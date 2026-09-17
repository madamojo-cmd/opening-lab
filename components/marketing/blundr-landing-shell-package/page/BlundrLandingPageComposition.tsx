import { BlundrMarketingHeader } from "../header/BlundrMarketingHeader";
import { BlundrHero } from "../hero/BlundrHero";
import { MomentumSection } from "../momentum/MomentumSection";
import { PricingSection } from "../pricing/PricingSection";
import { FinalCTA } from "../final-cta/FinalCTA";
import { BlundrMarketingFooter } from "../footer/BlundrMarketingFooter";
// Import these five from the existing blundr-training-demo-package; they are intentionally not duplicated here.
import { MarketingTrainingDemo, DailyBlundrMarketingDemo, SmartReviewMarketingDemo, MasteryMarketingDemo, DailyRingsMarketingDemo } from "@/components/marketing/blundr-training-demo-package";

export function BlundrLandingPageComposition({ Board, tempoImageSrc }: { Board: React.ComponentType<any>; tempoImageSrc: string }) {
  return <><BlundrMarketingHeader/><BlundrHero tempoImageSrc={tempoImageSrc}/><main><MarketingTrainingDemo Board={Board} tempoImageSrc={tempoImageSrc}/><DailyBlundrMarketingDemo Board={Board}/><SmartReviewMarketingDemo Board={Board}/><MasteryMarketingDemo tempoImageSrc={tempoImageSrc}/><DailyRingsMarketingDemo/><MomentumSection tempoImageSrc={tempoImageSrc}/><PricingSection/><FinalCTA/></main><BlundrMarketingFooter/></>;
}
