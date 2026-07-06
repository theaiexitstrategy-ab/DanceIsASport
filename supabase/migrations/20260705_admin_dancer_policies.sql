-- Admin access to dancers for the guardian co-sign flow.
-- Existing SELECT policies only expose published rows + the owner's own row, so an
-- unpublished minor awaiting co-sign is invisible to admins. And the only UPDATE
-- policy is owner-scoped, so no admin could confirm a co-sign via the API.
-- These two admin-scoped policies (role from JWT user_metadata) fix both.
-- Column-level protection still applies: the dancers_guard_protected_columns trigger
-- allows admins through, so admins CAN set guardian_cosign_confirmed while dancers can't.

drop policy if exists dancers_admin_read on public.dancers;
create policy dancers_admin_read on public.dancers
  for select to authenticated
  using (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

drop policy if exists dancers_admin_update on public.dancers;
create policy dancers_admin_update on public.dancers
  for update to authenticated
  using (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');
