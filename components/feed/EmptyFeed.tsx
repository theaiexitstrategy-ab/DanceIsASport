'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EmptyFeed() {
  return (
    <main className="min-h-[calc(100svh-66px)] flex flex-col items-center justify-center px-6 text-center">
      <motion.svg
        viewBox="0 0 200 200"
        width="160"
        height="160"
        className="mb-8 text-purple"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        <motion.polygon
          points="90,80 90,120 125,100"
          fill="currentColor"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0, 0.25] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: '100px 100px' }}
        />
      </motion.svg>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-serif text-4xl md:text-5xl text-ink leading-tight max-w-xl"
      >
        No reels yet.<br />
        <span className="italic text-purple">Be the first.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-ink2 max-w-md leading-relaxed"
      >
        Upload your reel during onboarding. The feed comes alive when dancers join.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Link
          href="/onboard"
          className="bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest px-7 py-3.5 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-[0.97] transition-all inline-block"
        >
          Upload My Reel
        </Link>
      </motion.div>
    </main>
  );
}
