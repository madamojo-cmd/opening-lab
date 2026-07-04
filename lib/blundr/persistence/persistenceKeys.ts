export const BLUNDR_LOCAL_ACCOUNT_STORAGE_KEY = "blundr.accounts.v1";
export const BLUNDR_LOCAL_DEMO_USER_ID = "local-demo-user";

export const BLUNDR_PERSISTENCE_TABLES = {
  userProfiles: "blundr_user_profiles",
  userRepertoires: "blundr_user_repertoires",
  dailyRetentionProgress: "blundr_daily_retention_progress",
  openingUnlockProgress: "blundr_opening_unlock_progress",
  openingUnlockEvents: "blundr_opening_unlock_events",
  repertoirePointEvents: "blundr_repertoire_point_events",
  repertoireUnlockEvents: "blundr_repertoire_unlock_events",
  streakRecords: "blundr_streak_records",
  rewardHistory: "blundr_reward_history",
  rewardRolls: "blundr_reward_rolls",
  validationSnapshots: "blundr_validation_snapshots",
  developerAuditLog: "blundr_developer_audit_log",
} as const;

export const BLUNDR_PERSISTENCE_MODES = {
  localDemo: "local_demo",
  authenticated: "authenticated",
  developerAdmin: "developer_admin",
  localOrSupabase: "local_or_supabase",
} as const;
