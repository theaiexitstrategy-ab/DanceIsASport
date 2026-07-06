'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Provider = 'google' | 'apple';

// Shared Google/Apple auth buttons used by both /login and /onboard so the two
// surfaces stay identical. All providers route through /auth/callback?next=… —
// the same destination handling as magic link. NOTE: these only function once the
// provider is enabled in the Supabase dashboard (Auth → Providers) with credentials.
export default function OAuthButtons({
  next,
  mode = 'login',
  onError,
}: {
  next: string;
  mode?: 'login' | 'signup';
  onError?: (message: string) => void;
}) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const verb = mode === 'signup' ? 'Sign up' : 'Continue';

  async function go(provider: Provider) {
    setLoading(provider);
    onError?.('');
    try {
      const sb = getSupabaseBrowser();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      // On success the browser redirects away; we only get here on error.
      if (error) {
        onError?.(error.message);
        setLoading(null);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => go('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-pale text-ink font-medium py-3.5 rounded-xl hover:border-purple-light hover:bg-purple-pale/40 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        {loading === 'google' ? 'Redirecting…' : `${verb} with Google`}
      </button>

      <button
        type="button"
        onClick={() => go('apple')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-ink text-white font-medium py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.3 12.9c0-2.1 1.7-3.1 1.8-3.1-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.7-3.1.7-.6 0-1.7-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.5 2.1 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-1 2.4-2c.7-1.1 1-2.2 1-2.3-.1 0-2.1-.9-2.1-3zM14.5 6.4c.5-.7.9-1.6.8-2.6-.8 0-1.9.6-2.5 1.3-.5.6-1 1.5-.9 2.5.9.1 1.9-.5 2.6-1.2z" />
        </svg>
        {loading === 'apple' ? 'Redirecting…' : `${verb} with Apple`}
      </button>
    </div>
  );
}
