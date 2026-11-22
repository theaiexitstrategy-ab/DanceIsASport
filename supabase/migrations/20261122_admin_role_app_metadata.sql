-- © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
-- Admin role moves from user_metadata to app_metadata.
--
-- user_metadata is editable by the signed-in user (supabase.auth.updateUser({ data: { role: 'admin' } })),
-- so anyone who signed up could make themselves admin and then:
--   * read every dancer row, including unpublished minors (dancers_admin_read)
--   * update any dancer (dancers_admin_update)
--   * change the platform toggles (admin_settings_admin_write)
--   * flip their own NIL verification / guardian co-sign past the protection trigger
-- app_metadata can only be set with the service role, so it's safe to trust.
--
-- Granting admin is done separately (this repo is public, so no accounts here):
--   update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--    where email = '<admin email>';
-- The admin then signs out and back in (or waits for the token refresh) to pick it up.
-- Idempotent: safe to re-run.

drop policy if exists admin_settings_admin_write on public.admin_settings;
create policy admin_settings_admin_write on public.admin_settings
  for update to authenticated
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

drop policy if exists dancers_admin_read on public.dancers;
create policy dancers_admin_read on public.dancers
  for select to authenticated
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

drop policy if exists dancers_admin_update on public.dancers;
create policy dancers_admin_update on public.dancers
  for update to authenticated
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

create or replace function public.dancers_guard_protected_columns()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  is_privileged boolean :=
    current_user in ('postgres', 'supabase_admin', 'service_role')
    or coalesce(((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin', false)
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
