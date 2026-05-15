import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-purple/15 bg-white/70 backdrop-blur-md mt-12">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="font-serif text-purple text-xl tracking-[0.04em] font-semibold">
            Dance<span className="text-ink font-light">IsASport</span>
          </Link>
          <p className="mt-4 text-ink2 text-sm leading-relaxed max-w-sm">
            The dancer marketplace. NIL-verified. Privacy-protected. Built for dancers, by dancers.
          </p>
          <div className="mt-6 flex gap-3">
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://tiktok.com" label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M16 4v3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1.3V16a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V4h3z" />
              </svg>
            </SocialIcon>
          </div>
        </div>
        <FooterCol title="For Dancers">
          <FooterLink href="/onboard">Join as Dancer</FooterLink>
          <FooterLink href="/dashboard">Dashboard</FooterLink>
          <FooterLink href="/feed">Feed</FooterLink>
        </FooterCol>
        <FooterCol title="Platform">
          <FooterLink href="/feed">Find Talent</FooterLink>
          <FooterLink href="/#featured">How It Works</FooterLink>
          <FooterLink href="/">NIL Info</FooterLink>
          <FooterLink href="/">Privacy</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-purple/10">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-5 text-center text-xs text-gray tracking-wide">
          © 2026 Dance Is A Sport. Built for dancers, by dancers.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-purple-mid mb-4">{title}</div>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink2 text-sm hover:text-purple transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, children, label }: { href: string; children: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full border border-purple/20 text-purple flex items-center justify-center bg-white/60 hover:bg-purple hover:text-white hover:border-purple transition-all active:scale-[0.92]"
    >
      {children}
    </a>
  );
}
