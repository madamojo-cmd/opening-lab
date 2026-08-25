# Supabase Function `search_path` Remediation (2026-08-25)

## Scope

This change addresses Supabase security advisor warnings about mutable function
`search_path` for the following known functions only:

- `public.blundr_touch_updated_at()`
- `public.blundr_normalize_username(text)`
- `public.blundr_validate_username_pair()`
- `public.blundr_learning_events_force_auth_user()`
- `public.blundr_game_data_force_auth_user()`

It does not modify function signatures, privileges, ownership, RLS policies, or
table grants. It does not attempt to resolve any other RLS/no-policy advisor
findings.

## Implementation

Migration:

- `supabase/migrations/20260825115518_harden-function-search-path.sql`

The migration uses `ALTER FUNCTION ... SET search_path = pg_catalog;` for each
function.

## Rollback / reversal

This repository uses forward-only migrations. Do not delete or edit applied
migrations.

To reverse this hardening (and likely reintroduce the advisor warnings), create
a new additive migration that resets the per-function `search_path` setting:

```sql
alter function if exists public.blundr_touch_updated_at() reset search_path;
alter function if exists public.blundr_normalize_username(text) reset search_path;
alter function if exists public.blundr_validate_username_pair() reset search_path;
alter function if exists public.blundr_learning_events_force_auth_user() reset search_path;
alter function if exists public.blundr_game_data_force_auth_user() reset search_path;
```

