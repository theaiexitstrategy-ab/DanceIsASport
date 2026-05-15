import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="font-serif text-purple text-sm tracking-[0.2em] uppercase mb-4">
        Dance Is A Sport
      </div>
      <h1 className="font-serif text-5xl md:text-7xl text-ink leading-[1.05] max-w-3xl">
        The dancer marketplace<span className="text-purple">.</span>
      </h1>
      <p className="mt-6 text-ink2 text-base md:text-lg max-w-xl leading-relaxed">
        NIL-verified dancer profiles. Privacy-protected booking. A marketplace built for the sport.
      </p>
      <div className="mt-10 flex gap-4 flex-wrap justify-center">
        <Link
          href="/onboard"
          className="font-serif tracking-widest text-white bg-purple px-8 py-4 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 transition-all"
        >
          Create Your Profile
        </Link>
        <Link
          href="/jasmine.dances"
          className="font-serif tracking-widest text-purple border border-purple/30 px-8 py-4 rounded-xl hover:bg-purple-pale transition-all"
        >
          View Sample Profile
        </Link>
      </div>
    </main>
  );
}
