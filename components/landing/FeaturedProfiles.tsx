'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

export type FeaturedDancer = {
  id: string;
  handle: string;
  display_name: string;
  location: string | null;
  avatar_url: string | null;
  top_style: string | null;
  rating: number;
};

export default function FeaturedProfiles({ dancers }: { dancers: FeaturedDancer[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    if (!scroller.current) return;
    const w = scroller.current.clientWidth;
    scroller.current.scrollBy({ left: dir * w * 0.7, behavior: 'smooth' });
  };

  return (
    <section id="featured" className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-serif text-purple text-xs md:text-sm tracking-[0.25em] uppercase mb-3">
              Featured
            </div>
            <h2 className="font-serif text-4xl md:text-6xl text-ink leading-tight">
              Dancers <span className="italic text-purple-mid">on the rise.</span>
            </h2>
          </motion.div>
          <div className="hidden md:flex gap-2">
            <NudgeBtn onClick={() => nudge(-1)} label="Scroll left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </NudgeBtn>
            <NudgeBtn onClick={() => nudge(1)} label="Scroll right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </NudgeBtn>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="overflow-x-auto snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-4 md:gap-5 px-5 md:px-10 pb-4">
          {dancers.length === 0
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : dancers.map((d, i) => <ProfileCard key={d.id} d={d} index={i} />)}

          <Link
            href="/feed"
            className="snap-start flex-shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-3xl border border-dashed border-purple/30 flex flex-col items-center justify-center text-purple gap-3 hover:bg-purple-pale/40 transition-colors active:scale-[0.97]"
          >
            <span className="font-serif text-2xl md:text-3xl italic">See all</span>
            <span className="text-xs tracking-[0.2em] uppercase">Dancers →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function NudgeBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full border border-purple/20 text-purple bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-purple hover:text-white hover:border-purple transition-all active:scale-[0.92]"
    >
      {children}
    </button>
  );
}

function ProfileCard({ d, index }: { d: FeaturedDancer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4) }}
      className="snap-start flex-shrink-0 w-[240px] md:w-[280px] group"
    >
      <Link
        href={`/${d.handle}`}
        className="block relative aspect-[3/4] rounded-3xl overflow-hidden bg-purple-pale border border-purple/10 transition-transform hover:-translate-y-1 active:scale-[0.98]"
      >
        {d.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.avatar_url}
            alt={d.display_name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-pale via-bg3 to-mint-pale" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            {d.top_style && (
              <span className="text-[0.6rem] uppercase tracking-widest px-2.5 py-1 rounded-full bg-mint/90 text-white">
                {d.top_style}
              </span>
            )}
            <span className="text-[0.6rem] uppercase tracking-widest text-white/80">★ {d.rating.toFixed(1)}</span>
          </div>
          <div className="font-serif text-xl md:text-2xl leading-tight">{d.display_name}</div>
          <div className="text-[0.72rem] text-white/70 mt-0.5">@{d.handle}</div>
        </div>
      </Link>
      <Link
        href={`/${d.handle}`}
        className="mt-3 flex items-center justify-center gap-2 w-full bg-purple text-white font-serif tracking-widest text-sm py-2.5 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 transition-all active:scale-[0.97]"
      >
        Book
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="snap-start flex-shrink-0 w-[240px] md:w-[280px]">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-purple-pale border border-purple/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-pale via-bg3 to-purple-pale animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
      </div>
      <div className="mt-3 h-9 rounded-xl bg-purple-pale animate-pulse" />
    </div>
  );
}
