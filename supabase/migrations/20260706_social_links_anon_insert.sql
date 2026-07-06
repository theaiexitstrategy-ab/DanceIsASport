-- Allow anonymous onboarding to create the Instagram social link, matching the
-- existing MVP anon-insert pattern on dancer_styles / dancer_services / dancer_media.
-- Update/delete stay owner-only via dancer_social_links_owner_manage.
-- (dancer_reel_videos intentionally stays owner-only — the reel is added post-login.)

drop policy if exists dancer_social_links_anon_insert on public.dancer_social_links;
create policy dancer_social_links_anon_insert on public.dancer_social_links
  for insert to public
  with check (true);
