import Nav from '@/components/Nav';
import VideoFeed from '@/components/feed/VideoFeed';
import EmptyFeed from '@/components/feed/EmptyFeed';
import { serverSupabase } from '@/lib/supabase';
import type { FeedItem } from '@/components/feed/types';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Feed — Dance Is A Sport',
  description: 'Discover dancers. Watch reels. Book the ones you love.',
};

const PAGE_SIZE = 10;

async function getInitialFeed(): Promise<FeedItem[]> {
  try {
    const sb = serverSupabase();
    const { data, error } = await sb
      .from('dancer_media')
      .select(
        'id, url, dancer_id, dancers!inner(handle, display_name, avatar_url, is_published, dancer_styles(style_name))',
      )
      .eq('media_type', 'video')
      .eq('dancers.is_published', true)
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (error || !data) {
      console.error('getInitialFeed error:', JSON.stringify(error));
      return [];
    }
    const out: FeedItem[] = [];
    for (const row of data as Record<string, unknown>[]) {
      const d = row.dancers as
        | { handle: string; display_name: string; avatar_url: string | null; dancer_styles: { style_name: string }[] }
        | undefined;
      if (!d) continue;
      out.push({
        id: row.id as string,
        url: row.url as string,
        dancer_id: row.dancer_id as string,
        dancer_handle: d.handle,
        dancer_name: d.display_name,
        dancer_avatar: d.avatar_url,
        dancer_top_style: d.dancer_styles?.[0]?.style_name ?? null,
      });
    }
    return out;
  } catch (e) {
    console.error('getInitialFeed threw:', e);
    return [];
  }
}

export default async function FeedPage() {
  const initial = await getInitialFeed();
  return (
    <>
      <Nav />
      {initial.length === 0 ? <EmptyFeed /> : <VideoFeed initial={initial} pageSize={PAGE_SIZE} />}
    </>
  );
}
