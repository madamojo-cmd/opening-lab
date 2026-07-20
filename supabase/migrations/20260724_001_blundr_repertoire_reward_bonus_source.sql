-- Keep the persisted repertoire event constraint aligned with the server-owned
-- Tempo Cache reward source. Existing rows and ownership policies are unchanged.
alter table public.blundr_repertoire_point_events
  drop constraint if exists blundr_repertoire_point_events_source_check;

alter table public.blundr_repertoire_point_events
  add constraint blundr_repertoire_point_events_source_check check (
    source in (
      'opening_run_completed',
      'continuation_completed',
      'daily_blundr_deck_completed',
      'reward_bonus',
      'manual_dev_adjustment'
    )
  );
