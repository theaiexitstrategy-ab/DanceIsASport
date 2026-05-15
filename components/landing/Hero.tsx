'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 pt-10 pb-16 text-center overflow-hidden">
      <DancerSilhouette />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-purple text-xs md:text-sm tracking-[0.25em] uppercase mb-5"
      >
        Dance Is A Sport
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-[3rem] sm:text-6xl md:text-8xl text-ink leading-[0.95] max-w-4xl"
      >
        Your moves.
        <br />
        <span className="italic text-purple">Your brand.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 md:mt-8 text-ink2 text-base md:text-xl max-w-xl leading-relaxed px-4"
      >
        The first platform built for dancers to get discovered, get booked, and get paid.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center px-4"
      >
        <Link
          href="/onboard"
          className="relative overflow-hidden group bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-[0.1em] text-base md:text-lg px-8 py-4 rounded-2xl shadow-purple-soft transition-all duration-300 hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-[0.96]"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-purple-mid to-mint opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          />
          <span className="relative z-10">Create Your Profile</span>
        </Link>
        <Link
          href="#featured"
          className="font-serif tracking-[0.1em] text-base md:text-lg text-purple border border-purple/30 bg-white/60 backdrop-blur-md px-8 py-4 rounded-2xl hover:bg-purple-pale transition-all hover:-translate-y-0.5 active:scale-[0.96]"
        >
          Find Talent
        </Link>
      </motion.div>

      <ScrollArrow />
    </section>
  );
}

function DancerSilhouette() {
  return (
    <motion.svg
      viewBox="0 0 200 360"
      className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 w-[260px] h-[440px] opacity-[0.22] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.22 }}
      transition={{ duration: 1.4, delay: 0.5 }}
    >
      <motion.g
        animate={{ rotate: [-3, 3, -3], y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 320px' }}
      >
        {/* Head */}
        <circle cx="100" cy="42" r="22" fill="url(#grad)" />
        {/* Body — flowing curve */}
        <path
          d="M100 64 C90 100 75 130 80 170 C85 210 70 240 65 290 L80 320"
          stroke="url(#grad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arms — extended */}
        <path
          d="M100 90 C60 110 30 130 18 105"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 90 C140 100 170 80 188 55"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Trailing leg */}
        <path
          d="M75 290 C110 280 140 250 165 220"
          stroke="url(#grad)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
      </motion.g>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="200" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7c5cbf" />
          <stop offset="1" stopColor="#5bbfa0" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

function ScrollArrow() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-purple-mid"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-[0.6rem] tracking-[0.2em] uppercase">Scroll</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
