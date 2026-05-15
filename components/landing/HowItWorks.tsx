'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'Create your profile',
    body: 'Photos, videos, services, NIL info — in minutes. Drop your styles, your reel, your rates.',
    icon: (
      <motion.svg
        viewBox="0 0 60 60"
        width="44"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <motion.circle
          cx="30"
          cy="22"
          r="9"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d="M14 52 C14 41 22 33 30 33 C38 33 46 41 46 52"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.svg>
    ),
  },
  {
    n: '02',
    title: 'Share your link',
    body: 'One link, everywhere. Bio, DMs, tees — your whole sport in one tap.',
    icon: (
      <motion.svg
        viewBox="0 0 60 60"
        width="44"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <motion.path
          d="M22 30 L38 30"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
        <motion.path
          d="M22 30 C16 30 10 26 10 20 C10 14 16 10 22 10 L26 10"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        />
        <motion.path
          d="M38 30 C44 30 50 34 50 40 C50 46 44 50 38 50 L34 50"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        />
      </motion.svg>
    ),
  },
  {
    n: '03',
    title: 'Get booked, get paid',
    body: 'Clients reach out through the platform. You stay anonymous. We handle the money.',
    icon: (
      <motion.svg
        viewBox="0 0 60 60"
        width="44"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <motion.rect
          x="12"
          y="18"
          width="36"
          height="26"
          rx="3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        />
        <motion.path
          d="M12 26 L48 26"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
        <motion.circle
          cx="40"
          cy="36"
          r="3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
        />
      </motion.svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative px-5 md:px-10 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-20"
        >
          <div className="font-serif text-purple text-xs md:text-sm tracking-[0.25em] uppercase mb-3">
            How it works
          </div>
          <h2 className="font-serif text-4xl md:text-6xl text-ink leading-tight max-w-2xl">
            Three steps.<br />
            <span className="italic text-purple-mid">No middlemen.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-purple/15 rounded-3xl p-7 md:p-9 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,92,191,0.12)] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-pale/40 to-mint-pale/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative z-10">
                <div className="font-serif text-5xl text-purple/30 italic mb-4">{s.n}</div>
                <div className="text-purple mb-5">{s.icon}</div>
                <h3 className="font-serif text-2xl md:text-3xl text-ink mb-3">{s.title}</h3>
                <p className="text-ink2 text-sm md:text-base leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
