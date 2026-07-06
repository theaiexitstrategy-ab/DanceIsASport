-- Dashboard profile management: new fields + column-level protection + child-table owner policies.
-- Safe to re-run (idempotent guards throughout).

-- 1. New profile columns on dancers ------------------------------------------
alter table public.dancers
  add column if not exists grad_year integer,
  add column if not exists team_studio text,
  add column if not exists height text,
  add column if not exists video_url text,
  add column if not exists guardian_name text,
  add column if not exists guardian_email text,
  add column if not exists requires_guardian_cosign boolean not null default false,
  add column if not exists guardian_cosign_confirmed boolean not null default false;

-- 2. Column-protection trigger -----------------------------------------------
-- Row-level RLS can't distinguish admin from dancer per-column (both are the
-- `authenticated` role), so a trigger enforces that compliance-sensitive columns
-- are admin-only. A dancer editing their OWN row still cannot flip these.
create or replace function public.dancers_guard_protected_columns()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  is_privileged boolean :=
    current_user in ('postgres', 'supabase_admin', 'service_role')
    or coalesce(((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin', false)
    or coalesce((auth.jwt() ->> 'role') = 'service_role', false);
begin
  if is_privileged then
    return new;
  end if;
  if new.guardian_cosign_confirmed is distinct from old.guardian_cosign_confirmed
     or new.requires_guardian_cosign is distinct from old.requires_guardian_cosign
     or new.nil_verified is distinct from old.nil_verified
     or new.user_id is distinct from old.user_id then
    raise exception
      'Protected columns (guardian cosign / NIL verification / ownership) can only be changed by an admin';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_dancers_guard_protected on public.dancers;
create trigger trg_dancers_guard_protected
  before update on public.dancers
  for each row execute function public.dancers_guard_protected_columns();

-- 3. Owner-management policies on child tables -------------------------------
-- Let a logged-in dancer manage their own styles/media/services, scoped by
-- dancers.user_id = auth.uid(). (Additive to the existing published-read policies.)
drop policy if exists dancer_styles_owner_manage on public.dancer_styles;
create policy dancer_styles_owner_manage on public.dancer_styles
  for all to authenticated
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_styles.dancer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.dancers d
                      where d.id = dancer_styles.dancer_id and d.user_id = auth.uid()));

drop policy if exists dancer_media_owner_manage on public.dancer_media;
create policy dancer_media_owner_manage on public.dancer_media
  for all to authenticated
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_media.dancer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.dancers d
                      where d.id = dancer_media.dancer_id and d.user_id = auth.uid()));

drop policy if exists dancer_services_owner_manage on public.dancer_services;
create policy dancer_services_owner_manage on public.dancer_services
  for all to authenticated
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_services.dancer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.dancers d
                      where d.id = dancer_services.dancer_id and d.user_id = auth.uid()));
