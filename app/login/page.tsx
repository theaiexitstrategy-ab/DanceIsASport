'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Logo from '@/components/Logo';
import Particles from '@/components/Particles';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function LoginInner() {
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const sb = getSupabaseBrowser();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      // Same destination as magic link: /auth/callback exchanges the code, then routes to `next`.
      const { error: e2 } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      // On success the browser redirects to Google, so we only reach here on error.
      if (e2) {
        setError(e2.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setGoogleLoading(false);
    }
  }

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
        <Logo size={120} priority className="mb-8" />

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
              <p className="text-ink2 text-sm mb-6">
                Enter your email. We&apos;ll send you a link to sign in instantly.
              </p>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-pale text-ink font-medium py-3.5 rounded-xl hover:border-purple-light hover:bg-purple-pale/40 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3 my-6">
                <span className="flex-1 h-px bg-gray-pale" />
                <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gray-light">or</span>
                <span className="flex-1 h-px bg-gray-pale" />
              </div>

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
