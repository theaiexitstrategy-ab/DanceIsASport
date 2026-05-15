'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FeedItem } from './types';

export default function VideoSlide({ item, onBook }: { item: FeedItem; onBook: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => 12 + ((item.id.charCodeAt(0) * 7) % 90));
  const [showCopied, setShowCopied] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          vid.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          vid.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 0.9] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  }

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => c + (next ? 1 : -1));
      if (next) setBurst((b) => b + 1);
      return next;
    });
  }

  async function share() {
    const url = `${window.location.origin}/${item.dancer_handle}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: item.dancer_name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      ref={containerRef}
      className="snap-start relative w-full h-[100svh] bg-ink overflow-hidden"
      onClick={togglePlay}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={item.url}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top gradient + bottom gradient */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 to-transparent pointer-events-none" />

      {/* Tap-to-play indicator */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            key={item.id + 'pause'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-ink/40 backdrop-blur-md flex items-center justify-center text-white text-2xl">
              ▶
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom left — dancer info */}
      <div className="absolute left-4 right-24 bottom-6 md:bottom-8 z-10 flex items-end gap-3" onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/${item.dancer_handle}`}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-mint shadow-lg flex-shrink-0 active:scale-95 transition-transform"
        >
          {item.dancer_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.dancer_avatar} alt={item.dancer_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple to-mint" />
          )}
        </Link>
        <div className="text-white pb-1 min-w-0">
          <div className="font-serif text-lg md:text-xl leading-tight truncate">{item.dancer_name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[0.75rem] text-white/80 truncate">@{item.dancer_handle}</span>
            {item.dancer_top_style && (
              <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full bg-mint/90 text-white whitespace-nowrap">
                {item.dancer_top_style}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom right — action strip */}
      <div
        className="absolute right-3 bottom-24 md:bottom-28 z-10 flex flex-col items-center gap-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionBtn onClick={toggleLike} count={likeCount}>
          <div className="relative">
            <motion.svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill={liked ? '#7c5cbf' : 'none'}
              stroke={liked ? '#7c5cbf' : 'currentColor'}
              strokeWidth="1.8"
              animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </motion.svg>
            <AnimatePresence>
              {burst > 0 && (
                <motion.span
                  key={burst}
                  initial={{ scale: 0.5, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-full bg-purple/40"
                />
              )}
            </AnimatePresence>
          </div>
        </ActionBtn>

        <Link
          href={`/${item.dancer_handle}`}
          aria-label="View profile"
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <span className="text-[0.6rem] uppercase tracking-widest">Profile</span>
        </Link>

        <button
          onClick={share}
          aria-label="Share profile"
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform relative"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v14" />
            </svg>
          </div>
          <span className="text-[0.6rem] uppercase tracking-widest">Share</span>
          <AnimatePresence>
            {showCopied && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-7 right-0 bg-mint text-white text-[0.65rem] px-2 py-1 rounded-md whitespace-nowrap"
              >
                Copied ✓
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button onClick={onBook} aria-label="Book this dancer" className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="w-12 h-12 rounded-full bg-purple flex items-center justify-center shadow-purple-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-[0.6rem] uppercase tracking-widest">Book</span>
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  count,
  children,
}: {
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
        {children}
      </div>
      <span className="text-[0.65rem] tabular-nums font-medium">{count}</span>
    </button>
  );
}
