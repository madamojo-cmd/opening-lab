-- Wave 2C: versioned legal consent, privacy preferences, and account deletion audit.
--
-- Ordinary clients may read their own legal/privacy records and update only
-- privacy preferences. Legal acceptance writes and deletion audit writes stay
-- server-owned so historical consent cannot be forged or rewritten from the
-- browser.

begin;

create table if not exists public.blundr_user_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  acceptance_context text not null,
  locale text,
  created_at timestamptz not null default now(),
  unique (user_id, document_type, document_version, acceptance_context),
  constraint blundr_user_legal_acceptances_identity_check check (
    document_type in ('terms', 'privacy')
    and document_version ~ '^[a-z0-9-]{4,80}$'
    and acceptance_context in ('signup', 'reconsent', 'upgrade')
    and (locale is null or char_length(locale) between 2 and 32)
  )
);

create table if not exists public.blundr_user_privacy_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  optional_analytics_consent boolean not null default false,
  analytics_consent_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blundr_account_deletion_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  deletion_status text not null,
  provider_cleanup jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint blundr_account_deletion_audit_check check (
    deletion_status in (
      'provider_cleanup_complete',
      'identity_deleted',
      'failed'
    )
    and jsonb_typeof(provider_cleanup) = 'object'
  )
);

create index if not exists idx_blundr_user_legal_acceptances_user
  on public.blundr_user_legal_acceptances (user_id, document_type, accepted_at desc);

alter table public.blundr_user_legal_acceptances enable row level security;
alter table public.blundr_user_privacy_preferences enable row level security;
alter table public.blundr_account_deletion_audit enable row level security;

revoke all on public.blundr_user_legal_acceptances,
  public.blundr_user_privacy_preferences,
  public.blundr_account_deletion_audit
  from public, anon, authenticated;

grant select on public.blundr_user_legal_acceptances,
  public.blundr_user_privacy_preferences
  to authenticated;

grant insert, update on public.blundr_user_privacy_preferences
  to authenticated;

grant select, insert, update, delete on public.blundr_user_legal_acceptances,
  public.blundr_user_privacy_preferences,
  public.blundr_account_deletion_audit
  to service_role;

create policy blundr_user_legal_acceptances_select_own
  on public.blundr_user_legal_acceptances for select to authenticated
  using (user_id = auth.uid());

create policy blundr_user_privacy_preferences_select_own
  on public.blundr_user_privacy_preferences for select to authenticated
  using (user_id = auth.uid());

create policy blundr_user_privacy_preferences_insert_own
  on public.blundr_user_privacy_preferences for insert to authenticated
  with check (user_id = auth.uid());

create policy blundr_user_privacy_preferences_update_own
  on public.blundr_user_privacy_preferences for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger blundr_user_privacy_preferences_touch_updated_at
before update on public.blundr_user_privacy_preferences
for each row execute function public.blundr_touch_updated_at();

commit;
