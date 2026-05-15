'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

export type FeedVideo = {
  id: string;
  url: string;
  dancer_handle: string;
  dancer_name: string;
};

export default function VideoFeedPreview({ videos }: { videos: FeedVideo[] }) {
  return (
    <section className="relative py-20 md:py-32 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-serif text-purple text-xs md:text-sm tracking-[0.25em] uppercase mb-3">
              Now playing
            </div>
            <h2 className="font-serif text-4xl md:text-6xl text-ink leading-tight">
              Discover <span className="italic text-purple-mid">dancers.</span>
            </h2>
          </motion.div>
          <Link
            href="/feed"
            className="hidden md:inline-flex items-center gap-2 text-purple font-serif text-base tracking-widest border border-purple/30 px-5 py-3 rounded-2xl hover:bg-purple-pale transition-colors active:scale-[0.97]"
          >
            Watch more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-gradient-to-r from-purple-pale via-bg3 to-purple-pale animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {videos.slice(0, 6).map((v, i) => (
              <VideoTile key={v.id} v={v} index={i} />
            ))}
          </div>
        )}

        <div className="md:hidden mt-8 flex justify-center">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-purple font-serif text-base tracking-widest border border-purple/30 px-6 py-3 rounded-2xl hover:bg-purple-pale transition-colors active:scale-[0.97]"
          >
            Watch more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function VideoTile({ v, index }: { v: FeedVideo; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4) }}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-purple-pale border border-purple/10 group cursor-pointer"
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => {
        const v = videoRef.current;
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }}
    >
      <Link href={`/${v.dancer_handle}`} className="absolute inset-0 z-10" aria-label={v.dancer_name}>
        <span className="sr-only">{v.dancer_name}</span>
      </Link>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={v.url}
        muted
        playsInline
        loop
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white">
        <div className="font-serif text-base md:text-lg leading-tight">{v.dancer_name}</div>
        <div className="text-[0.7rem] text-white/80">@{v.dancer_handle}</div>
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
        ▶
      </div>
    </motion.div>
  );
}
