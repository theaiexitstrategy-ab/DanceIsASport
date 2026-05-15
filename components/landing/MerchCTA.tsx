'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MerchCTA() {
  return (
    <section className="relative py-20 md:py-32 px-5 md:px-10 overflow-hidden">
      <div
        className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,92,191,0.25), transparent 60%)' }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,191,160,0.25), transparent 60%)' }}
      />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="font-serif text-purple text-xs md:text-sm tracking-[0.25em] uppercase mb-4">
            Rep your brand
          </div>
          <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.02] mb-5">
            Your tee.<br />
            <span className="italic text-mint">Your QR.</span>
            <br />
            Your bookings.
          </h2>
          <p className="text-ink2 text-base md:text-lg leading-relaxed max-w-md mb-8">
            Get a Dance Is A Sport tee with your own QR code on the back. Every scan goes straight to your profile.
            Wear it to class, to auditions, to the function — your card is on your back.
          </p>
          <Link
            href="/dashboard?tab=merch"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-ink to-purple text-white font-serif tracking-[0.1em] text-base md:text-lg px-7 py-4 rounded-2xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-[0.97] transition-all"
          >
            Get My Shirt
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center"
        >
          <MockShirt />
        </motion.div>
      </div>
    </section>
  );
}

function MockShirt() {
  return (
    <div className="relative w-[260px] md:w-[360px] aspect-[3/4]">
      {/* Tee shape */}
      <svg viewBox="0 0 300 360" className="w-full h-full">
        <defs>
          <linearGradient id="teeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1625" />
            <stop offset="100%" stopColor="#2a2535" />
          </linearGradient>
        </defs>
        <path
          d="M70 60 L120 30 C130 50 170 50 180 30 L230 60 L260 100 L230 130 L210 110 L210 320 L90 320 L90 110 L70 130 L40 100 Z"
          fill="url(#teeGrad)"
        />
      </svg>
      {/* QR code mock */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[36%] aspect-square bg-white rounded-md p-1.5 shadow-2xl">
        <QRMock />
      </div>
      {/* Logo above QR */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 font-serif text-white text-[0.7rem] md:text-sm tracking-[0.2em]">
        DanceIsASport
      </div>
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-white/70 text-[0.55rem] tracking-[0.3em] uppercase">
        scan me
      </div>
    </div>
  );
}

function QRMock() {
  return (
    <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-[1px]">
      {Array.from({ length: 81 }).map((_, i) => {
        // deterministic pseudo-pattern
        const on = ((i * 37 + (i % 9) * 13) % 7) % 2 === 0;
        return <span key={i} className={on ? 'bg-ink' : 'bg-white'} />;
      })}
      {/* corner markers */}
      <span className="absolute top-1.5 left-1.5 w-[18%] h-[18%] border-[3px] border-ink rounded-sm" />
      <span className="absolute top-1.5 right-1.5 w-[18%] h-[18%] border-[3px] border-ink rounded-sm" />
      <span className="absolute bottom-1.5 left-1.5 w-[18%] h-[18%] border-[3px] border-ink rounded-sm" />
    </div>
  );
}
