'use client';

const ITEMS = [
  { text: 'NIL Verified', mint: false },
  { text: 'Privacy Protected', mint: true },
  { text: '100% Free to Join', mint: false },
  { text: 'Get Booked', mint: true },
  { text: 'Own Your Brand', mint: false },
  { text: 'Dance Is A Sport', mint: true },
];

export default function SocialProofMarquee() {
  const loop = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative py-6 md:py-8 border-y border-purple/15 bg-white/70 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite]">
        {loop.map((item, i) => (
          <span
            key={i}
            className={`font-serif text-2xl md:text-4xl px-6 md:px-10 ${item.mint ? 'text-mint' : 'text-purple'}`}
          >
            {item.text} <span className="text-purple-light/40 mx-2">·</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.33%);
          }
        }
      `}</style>
    </div>
  );
}
