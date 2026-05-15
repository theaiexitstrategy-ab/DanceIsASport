'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { browserSupabase } from '@/lib/supabase';
import VideoSlide from './VideoSlide';
import MiniBookingModal from './MiniBookingModal';
import type { FeedItem } from './types';

export default function VideoFeed({ initial, pageSize }: { initial: FeedItem[]; pageSize: number }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < pageSize);
  const [booking, setBooking] = useState<{ id: string; name: string } | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initial.map((i) => i.id)));

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const sb = browserSupabase();
      const offset = items.length;
      const { data, error } = await sb
        .from('dancer_media')
        .select(
          'id, url, dancer_id, dancers!inner(handle, display_name, avatar_url, is_published, dancer_styles(style_name))',
        )
        .eq('media_type', 'video')
        .eq('dancers.is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (error) {
        console.error('loadMore error:', error);
        setLoading(false);
        return;
      }
      const next: FeedItem[] = [];
      for (const row of (data || []) as Record<string, unknown>[]) {
        const d = row.dancers as
          | {
              handle: string;
              display_name: string;
              avatar_url: string | null;
              dancer_styles: { style_name: string }[];
            }
          | undefined;
        if (!d) continue;
        const id = row.id as string;
        if (seenIds.current.has(id)) continue;
        seenIds.current.add(id);
        next.push({
          id,
          url: row.url as string,
          dancer_id: row.dancer_id as string,
          dancer_handle: d.handle,
          dancer_name: d.display_name,
          dancer_avatar: d.avatar_url,
          dancer_top_style: d.dancer_styles?.[0]?.style_name ?? null,
        });
      }
      setItems((prev) => [...prev, ...next]);
      if (next.length < pageSize) setDone(true);
    } catch (e) {
      console.error('loadMore threw:', e);
    } finally {
      setLoading(false);
    }
  }, [items.length, loading, done, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="h-[100svh] overflow-y-scroll snap-y snap-mandatory bg-ink scrollbar-none [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <VideoSlide
            key={item.id}
            item={item}
            onBook={() => setBooking({ id: item.dancer_id, name: item.dancer_name })}
          />
        ))}
        <div ref={sentinelRef} className="h-2" />
        {loading && (
          <div className="snap-start h-[100svh] flex items-center justify-center text-purple-light text-xs uppercase tracking-[0.3em]">
            Loading…
          </div>
        )}
        {done && items.length > 0 && (
          <div className="snap-start h-[100svh] flex flex-col items-center justify-center text-white/60 text-sm gap-3 px-6 text-center">
            <div className="font-serif text-3xl text-white">That&apos;s everyone.</div>
            <div className="text-white/50">More reels drop daily. Check back soon.</div>
          </div>
        )}
      </div>
      <MiniBookingModal
        open={booking !== null}
        dancerId={booking?.id || ''}
        dancerName={booking?.name || ''}
        onClose={() => setBooking(null)}
      />
    </>
  );
}
