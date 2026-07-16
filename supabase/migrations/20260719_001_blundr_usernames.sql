-- Add the Blundr-facing username to the existing private account profile.
-- Ownership remains the Supabase auth user; no public profile is exposed.

alter table public.blundr_user_profiles
  add column if not exists username text,
  add column if not exists normalized_username text;

create unique index if not exists blundr_user_profiles_normalized_username_unique
  on public.blundr_user_profiles (normalized_username)
  where normalized_username is not null;

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_username_shape_check;
alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_username_shape_check
  check (
    username is null
    or username ~ '^[A-Za-z][a-z0-9_]{2,23}$'
  );

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_normalized_username_shape_check;
alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_normalized_username_shape_check
  check (
    normalized_username is null
    or normalized_username ~ '^[a-z][a-z0-9_]{2,23}$'
  );

create or replace function public.blundr_normalize_username(value text)
returns text
language sql
immutable
as $$
  select lower(trim(value));
$$;

create or replace function public.blundr_validate_username_pair()
returns trigger
language plpgsql
as $$
begin
  if new.username is null or trim(new.username) = '' then
    new.username := null;
    new.normalized_username := null;
    return new;
  end if;
  new.username := trim(new.username);
  new.normalized_username := public.blundr_normalize_username(new.username);
  return new;
end;
$$;

drop trigger if exists blundr_user_profiles_validate_username on public.blundr_user_profiles;
create trigger blundr_user_profiles_validate_username
before insert or update of username, normalized_username on public.blundr_user_profiles
for each row execute function public.blundr_validate_username_pair();

-- Ordinary clients may update only their own profile row; the API still limits
-- the writable fields to username and never accepts user_id from the browser.
