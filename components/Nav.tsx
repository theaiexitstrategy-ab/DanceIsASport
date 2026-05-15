import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-5 md:px-10 py-5 bg-white/85 border-b border-purple/15 sticky top-0 z-[100] backdrop-blur-xl animate-[navSlide_0.6s_cubic-bezier(0.22,1,0.36,1)_both]">
      <Link href="/" className="font-serif text-[1.3rem] font-semibold tracking-[0.04em] text-purple relative group">
        Dance<span className="text-ink font-light">IsASport</span>
        <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 group-hover:w-full transition-[width] duration-300 bg-gradient-to-r from-purple to-mint rounded-sm" />
      </Link>
      <div className="flex gap-4 md:gap-8 items-center">
        <Link href="/" className="text-gray text-[0.78rem] tracking-[0.1em] uppercase hover:text-purple transition-colors">
          Find Talent
        </Link>
        <Link href="/" className="hidden sm:inline text-gray text-[0.78rem] tracking-[0.1em] uppercase hover:text-purple transition-colors">
          How It Works
        </Link>
        <Link
          href="/onboard"
          className="bg-purple text-white px-5 py-2 text-[0.72rem] uppercase tracking-[0.1em] rounded-full shadow-purple-soft hover:-translate-y-0.5 hover:shadow-purple-lift transition-all"
        >
          Join as Dancer
        </Link>
      </div>
    </nav>
  );
}
