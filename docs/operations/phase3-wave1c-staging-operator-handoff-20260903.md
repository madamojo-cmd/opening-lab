# Phase 3 Wave 1C Staging Operator Handoff

Date: 2026-09-03

## Scope

This is a non-production staging-only recovery handoff for the Phase 3 launch
experience. Do not select production, do not change production Auth settings,
and do not apply this to any production database.

The source branch is `launch/market-phase3-canonical-landing`. The predecessor
checkpoint is `e0c42c35a8b7b0d47fc0f5ee4eeb0ba6134a3ec2`.

## Source-Side Migration

New migration:

`supabase/migrations/20260903155151_blundr_onboarding_v11_step_constraint_repair.sql`

```sql
-- Keep the database constraint aligned with the V11 onboarding presentation.
-- The forward app contract added the line-changes and review education steps;
-- historical migrations remain immutable, so this migration replaces only the
-- narrow check constraint without changing ownership, RLS, or persistence shape.

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_onboarding_step_check;

alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_onboarding_step_check
  check (onboarding_step in (
    'welcome', 'level', 'priorities', 'starter-pack', 'training-mode', 'pace',
    'line-changes', 'review', 'plan', 'ready'
  ));
```

This migration is idempotent for the named check constraint and does not create
tables, change RLS policies, grant privileges, mutate user data, or add billing
state.

## Required Staging Preflight

From a clean checkout of the Phase 3 branch, confirm:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
npm run verify:migrations
```

Expected source migration state:

- Migration count: `45`
- Migration head: `20260903155151`

Before applying anything, confirm in the Supabase dashboard and CLI that the
selected project is the dedicated non-production staging project. Do not proceed
if the project name, organization, or environment is production.

## Apply Path

Preferred CLI path:

```bash
npx --yes supabase@2.111.0 link --project-ref <STAGING_PROJECT_REF> --password <STAGING_DB_PASSWORD>
npx --yes supabase@2.111.0 migration list --linked
npx --yes supabase@2.111.0 db push --dry-run
```

Review the dry-run output before applying. If staging is at repository head
`20260826130803`, the pending set should include only:

```text
20260903155151_blundr_onboarding_v11_step_constraint_repair.sql
```

If older repository migrations are also pending, stop and reconcile the full
pending list as repository-backed staging drift. Do not apply ad hoc SQL that
leaves `supabase_migrations.schema_migrations` inconsistent with the repo.

Apply only after the pending list is reviewed:

```bash
npx --yes supabase@2.111.0 db push
npx --yes supabase@2.111.0 migration list --linked
```

## Verification Queries

Run against staging only:

```sql
select version
from supabase_migrations.schema_migrations
order by version desc
limit 5;
```

Expected head:

```text
20260903155151
```

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'blundr_user_profiles'
  and column_name = 'daily_blundr_card_goal';
```

Expected:

- One row exists.
- `data_type` is `integer`.
- `is_nullable` is `NO`.
- `column_default` is `10`.

```sql
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.blundr_user_profiles'::regclass
  and conname in (
    'blundr_user_profiles_onboarding_step_check',
    'blundr_user_profiles_daily_blundr_card_goal_check'
  )
order by conname;
```

Expected:

- `blundr_user_profiles_onboarding_step_check` accepts:
  `welcome`, `level`, `priorities`, `starter-pack`, `training-mode`, `pace`,
  `line-changes`, `review`, `plan`, `ready`.
- `blundr_user_profiles_daily_blundr_card_goal_check` accepts values from `1`
  through `99`.

Use one confirmed staging QA account. Fill in its user ID locally; do not paste
service-role keys or user credentials into chat.

```sql
begin;

update public.blundr_user_profiles
set onboarding_step = 'line-changes',
    daily_blundr_card_goal = 5
where id = '<CONFIRMED_STAGING_QA_USER_ID>';

update public.blundr_user_profiles
set onboarding_step = 'review',
    daily_blundr_card_goal = 99
where id = '<CONFIRMED_STAGING_QA_USER_ID>';

rollback;
```

Expected: both updates succeed inside the transaction.

```sql
begin;

update public.blundr_user_profiles
set onboarding_step = 'unknown'
where id = '<CONFIRMED_STAGING_QA_USER_ID>';

rollback;
```

Expected: the update fails with
`blundr_user_profiles_onboarding_step_check`.

## Authenticated Journey After Schema Alignment

Use the same confirmed staging QA account. Do not repeatedly invoke public
signup while Auth email rate limits are active.

Required journey:

```text
Anonymous landing -> signup/sign-in surface -> confirmed account session ->
every V11 onboarding step -> select Free -> Home -> Train -> sign out ->
sign back in -> Home -> Train
```

Verify:

- Staging accepts the `line-changes` and `review` onboarding steps.
- `daily_blundr_card_goal` persists.
- Free selection completes onboarding.
- Pro presentation remains inactive and never grants Pro.
- Completed users are not returned to onboarding after sign-in.
- Home and Train load without console errors.
- No cross-user state is visible.

## Applied Staging Evidence

This operator action was completed from the recovery worktree on 2026-09-03
against the confirmed non-production staging project only.

- `db push --dry-run` proposed exactly
  `20260903155151_blundr_onboarding_v11_step_constraint_repair.sql`.
- `db push` applied `20260903155151`.
- Remote migration history reported `45` applied migrations with head
  `20260903155151`.
- Reversible profile probes confirmed `line-changes` and `review` are accepted,
  invalid onboarding steps remain rejected, `daily_blundr_card_goal` remains
  present, and the QA profile row was restored.
- The authenticated V11 staging journey passed using one existing confirmed QA
  account, without public signup loops or production Auth changes.
- `npm run test:security` passed against staging with the explicit
  non-production role guard.

## Rollback / Recovery

If the new constraint must be backed out before acceptance, apply a new forward
migration that restores the previous allowed step set. Do not edit or remove
`20260903155151_blundr_onboarding_v11_step_constraint_repair.sql` after it has
been applied anywhere.

Production remains untouched. This handoff does not authorize commercial
release or `RELEASE-001` completion.
