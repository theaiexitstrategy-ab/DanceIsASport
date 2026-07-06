-- Dancer social links (manual entry, Phase 1). One row per (dancer, platform).
-- connection_type is 'manual' now; Phase 2 can add 'oauth' rows + nullable token
-- columns additively without restructuring this table.

create table if not exists public.dancer_social_links (
  id uuid primary key default gen_random_uuid(),
  dancer_id uuid not null references public.dancers(id) on delete cascade,
  platform text not null,               -- 'instagram' | 'tiktok' | 'youtube' | 'twitch'
  handle_or_url text not null,
  connection_type text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dancer_id, platform)
);

alter table public.dancer_social_links enable row level security;

drop policy if exists dancer_social_links_public_read on public.dancer_social_links;
create policy dancer_social_links_public_read on public.dancer_social_links
  for select to public
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_social_links.dancer_id and d.is_published = true));

drop policy if exists dancer_social_links_owner_manage on public.dancer_social_links;
create policy dancer_social_links_owner_manage on public.dancer_social_links
  for all to authenticated
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_social_links.dancer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.dancers d
                      where d.id = dancer_social_links.dancer_id and d.user_id = auth.uid()));

-- Backfill existing legacy columns so nothing is lost when the public page switches
-- to reading this table.
insert into public.dancer_social_links (dancer_id, platform, handle_or_url, connection_type)
select id, 'instagram', instagram, 'manual'
from public.dancers
where instagram is not null and btrim(instagram) <> ''
on conflict (dancer_id, platform) do nothing;

insert into public.dancer_social_links (dancer_id, platform, handle_or_url, connection_type)
select id, 'tiktok', tiktok, 'manual'
from public.dancers
where tiktok is not null and btrim(tiktok) <> ''
on conflict (dancer_id, platform) do nothing;
