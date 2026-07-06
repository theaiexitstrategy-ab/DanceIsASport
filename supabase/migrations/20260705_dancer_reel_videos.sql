-- Dancer video reel: a collection of short-form videos (separate from the single
-- dancers.video_url recruiting video). YouTube/Vimeo/Instagram/TikTok links.

create table if not exists public.dancer_reel_videos (
  id uuid primary key default gen_random_uuid(),
  dancer_id uuid not null references public.dancers(id) on delete cascade,
  video_url text not null,
  platform text,                        -- 'youtube' | 'vimeo' | 'instagram' | 'tiktok' | null
  display_order integer not null default 0,
  date_added timestamptz not null default now()
);

alter table public.dancer_reel_videos enable row level security;

drop policy if exists dancer_reel_videos_public_read on public.dancer_reel_videos;
create policy dancer_reel_videos_public_read on public.dancer_reel_videos
  for select to public
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_reel_videos.dancer_id and d.is_published = true));

drop policy if exists dancer_reel_videos_owner_manage on public.dancer_reel_videos;
create policy dancer_reel_videos_owner_manage on public.dancer_reel_videos
  for all to authenticated
  using (exists (select 1 from public.dancers d
                 where d.id = dancer_reel_videos.dancer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.dancers d
                      where d.id = dancer_reel_videos.dancer_id and d.user_id = auth.uid()));

create index if not exists dancer_reel_videos_dancer_order_idx
  on public.dancer_reel_videos (dancer_id, display_order);
