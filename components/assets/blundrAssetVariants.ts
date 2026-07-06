export const BLUNDR_ASSET_IMAGE_VARIANTS = [
  "tempoAvatar",
  "tempoInline",
  "tempoCard",
  "tempoHero",
  "rewardIcon",
  "rewardCard",
  "rewardHero",
  "rewardAnimation",
  "onboardingIllustration",
  "starterPackArt",
  "emptyState",
  "brandWordmark",
  "appIcon",
] as const;

export type BlundrAssetImageVariant = (typeof BLUNDR_ASSET_IMAGE_VARIANTS)[number];

export const BLUNDR_ASSET_IMAGE_VARIANT_FRAME_CLASSES: Record<BlundrAssetImageVariant, string> = {
  tempoAvatar: "h-[clamp(2.75rem,6vw,4rem)] w-[clamp(2.75rem,6vw,4rem)] rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),rgba(251,252,247,1)_72%)] p-1.5 ring-1 ring-green-200",
  tempoInline: "h-[clamp(4rem,8vw,5.25rem)] w-[clamp(4rem,8vw,5.25rem)] rounded-[1.5rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  tempoCard: "w-full max-w-[clamp(8rem,26vw,11rem)] aspect-[4/5] rounded-[1.75rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  tempoHero: "w-full max-w-[clamp(11rem,34vw,16rem)] aspect-[4/5] rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  rewardIcon: "h-[clamp(2.5rem,5vw,3.5rem)] w-[clamp(2.5rem,5vw,3.5rem)] rounded-[1.1rem] bg-[#fbfcf7] p-1.5 ring-1 ring-stone-200",
  rewardCard: "w-full max-w-[clamp(7rem,24vw,10rem)] aspect-square rounded-[1.75rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  rewardHero: "w-full max-w-[clamp(10rem,32vw,15rem)] aspect-square rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  rewardAnimation: "w-full max-w-[clamp(16rem,82vw,28rem)] aspect-[16/11] rounded-[2rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  onboardingIllustration: "w-full max-w-[clamp(14rem,36vw,18rem)] aspect-[4/3] rounded-[2rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  starterPackArt: "w-full max-w-[clamp(7rem,22vw,10rem)] aspect-square rounded-[1.5rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  emptyState: "w-full max-w-[clamp(11rem,34vw,16rem)] aspect-[4/3] rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  brandWordmark: "w-full max-w-[clamp(8rem,28vw,14rem)] rounded-none bg-transparent p-0",
  appIcon: "h-[clamp(2.75rem,6vw,4rem)] w-[clamp(2.75rem,6vw,4rem)] rounded-[1.25rem] bg-[#fbfcf7] p-1.5 ring-1 ring-stone-200",
};

export const BLUNDR_VIDEO_ASSET_VARIANT_FRAME_CLASSES = {
  rewardAnimation: "w-full max-w-[clamp(16rem,82vw,28rem)] aspect-[16/11] rounded-[2rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
} as const;

