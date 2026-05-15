'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Particles from '@/components/Particles';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function LoginInner() {
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    try {
      const sb = getSupabaseBrowser();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: e2 } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (e2) {
        setError(e2.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Particles count={35} />
      <main className="relative z-[1] min-h-[100svh] flex flex-col items-center justify-center px-5">
        <Link href="/" className="font-serif text-purple text-xl tracking-[0.04em] font-semibold mb-10">
          Dance<span className="text-ink font-light">IsASport</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-7 md:p-9 shadow-[0_30px_60px_rgba(124,92,191,0.12)]"
        >
          {sent ? (
            <div className="text-center py-4">
              <div className="font-serif text-3xl text-ink mb-3">Check your inbox</div>
              <p className="text-ink2 text-sm leading-relaxed">
                We sent a magic link to <strong className="text-purple">{email}</strong>. Tap the link from your phone or
                laptop and you&apos;re in.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="mt-6 text-purple text-sm underline underline-offset-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="font-serif text-xs text-purple tracking-[0.2em] uppercase mb-3">Sign in</div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-2">
                One tap. <span className="italic text-purple-mid">No passwords.</span>
              </h1>
              <p className="text-ink2 text-sm mb-7">
                Enter your email. We&apos;ll send you a link to sign in instantly.
              </p>

              <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray mb-2">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3.5 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] focus:-translate-y-px transition-all"
              />

              {error && (
                <div className="mt-3 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-6 w-full bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest py-3.5 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send Magic Link'}
              </button>

              <div className="mt-5 text-center text-xs text-gray">
                New here?{' '}
                <Link href="/onboard" className="text-purple underline underline-offset-2">
                  Create your profile
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-bg" />}>
      <LoginInner />
    </Suspense>
  );
}
