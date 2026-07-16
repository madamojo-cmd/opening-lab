import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { DEEP_MINI_GAME_REGISTRY } from "@/lib/blundr/daily/miniGames/deep";

export const dynamic = "force-dynamic";

export async function GET() {
  const flags = getServerFeatureFlags();
  return NextResponse.json({
    flags,
    providers: {
      chesscom: flags.game_data_connections && flags.game_data_chess_com,
      lichess: flags.game_data_connections && flags.game_data_lichess,
    },
    daily: {
      productionStore: flags.daily_production_store,
      activities: {
        candidate_choice: flags.daily_candidate_choice,
        plan_recall: flags.daily_plan_recall,
        same_position_different_route:
          flags.daily_same_position_different_route,
        continuation_challenge: flags.daily_continuation_challenge,
        punish_the_mistake: flags.daily_punish_the_mistake,
        mixed_test: flags.daily_mixed_test,
      },
    },
    deepMiniGames: flags.daily_deep_minigames ? DEEP_MINI_GAME_REGISTRY : [],
    repertoireOpeningDetail: flags.repertoire_opening_detail,
  });
}
