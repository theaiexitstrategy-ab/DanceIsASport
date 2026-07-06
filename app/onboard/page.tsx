'use client';

// Interactive single-question-at-a-time onboarding wizard.
// Replaces the old 4-step scrolling form (see git history / commit d5d8720).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Particles from '@/components/Particles';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import QuestionEngine from './QuestionEngine';
import { QUESTIONS, type Answers } from './questions';

type Status = 'intro' | 'building' | 'saving' | 'error';

// Experience chip buckets → the integer years_experience column.
const EXPERIENCE_TO_YEARS: Record<string, number> = { '<1': 0, '1-2': 2, '3-4': 4, '5+': 5 };

function str(answers: Answers, key: string): string {
  const v = answers[key];
  return typeof v === 'string' ? v.trim() : '';
}
function arr(answers: Answers, key: string): string[] {
  const v = answers[key];
  return Array.isArray(v) ? v : [];
}

/** Derive a unique handle from the dancer's name using the check_handle_available RPC. */
async function deriveHandle(
  sb: ReturnType<typeof getSupabaseBrowser>,
  first: string,
  last: string,
): Promise<string> {
  let base = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (base.length < 3) base = `${base || 'dancer'}dancer`;
  base = base.slice(0, 26);
  let candidate = base;
  let n = 1;
  for (let i = 0; i < 25; i++) {
    const { data } = await sb.rpc('check_handle_available', { p_handle: candidate });
    if (data) return candidate;
    candidate = `${base}${n++}`;
  }
  return `${base}${Date.now() % 10000}`;
}

export default function OnboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save(final: Answers) {
    setStatus('saving');
    setSaveError(null);
    try {
      const sb = getSupabaseBrowser();
      const {
        data: { user },
      } = await sb.auth.getUser();

      const first = str(final, 'first_name');
      const last = str(final, 'last_name');
      const handle = await deriveHandle(sb, first, last);
      const gradYear = str(final, 'grad_year');
      const experience = str(final, 'experience');

      const { data: dancer, error: dErr } = await sb
        .from('dancers')
        .insert({
          handle,
          display_name: `${first} ${last}`.trim() || handle,
          location: str(final, 'location') || null,
          bio: str(final, 'bio') || null,
          years_experience: experience in EXPERIENCE_TO_YEARS ? EXPERIENCE_TO_YEARS[experience] : null,
          grad_year: gradYear ? Number(gradYear) : null,
          team_studio: str(final, 'team_studio') || null,
          height: str(final, 'height') || null,
          video_url: str(final, 'video_url') || null,
          is_published: true,
          user_id: user?.id ?? null,
        })
        .select()
        .single();
      if (dErr || !dancer) throw new Error(dErr?.message || 'Could not create your profile');

      // Styles (primary + additional), de-duplicated.
      const styles = Array.from(new Set([str(final, 'primary_style'), ...arr(final, 'additional_styles')].filter(Boolean)));
      if (styles.length) {
        const { error } = await sb
          .from('dancer_styles')
          .insert(styles.map((style_name) => ({ dancer_id: dancer.id, style_name })));
        if (error) console.error('styles insert failed:', error.message);
      }

      // Instagram → social links table (canonical).
      const instagram = str(final, 'instagram');
      if (instagram) {
        const { error } = await sb.from('dancer_social_links').insert({
          dancer_id: dancer.id,
          platform: 'instagram',
          handle_or_url: instagram,
          connection_type: 'manual',
        });
        if (error) console.error('instagram social link insert failed:', error.message);
      }

      router.push(user ? '/dashboard' : `/${handle}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong creating your profile.');
      setStatus('error');
    }
  }

  return (
    <>
      <Particles count={35} />
      <Nav />
      <main className="relative z-[1] max-w-2xl mx-auto px-5 md:px-8">
        {status === 'intro' && (
          <div className="min-h-[80dvh] flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-7 md:p-9 shadow-[0_30px_60px_rgba(124,92,191,0.12)]">
              <div className="font-serif text-xs text-purple tracking-[0.2em] uppercase mb-3">
                Create your profile
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-2">
                Let&apos;s build your <span className="italic text-purple-mid">dancer profile.</span>
              </h1>
              <p className="text-ink2 text-sm mb-7">
                Sign up so your profile is saved to your account — or just start building and link it
                later.
              </p>

              <OAuthButtons next="/onboard" mode="signup" onError={setAuthError} />

              {authError && (
                <div className="mt-3 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {authError}
                </div>
              )}

              <div className="flex items-center gap-3 my-6">
                <span className="flex-1 h-px bg-gray-pale" />
                <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gray-light">or</span>
                <span className="flex-1 h-px bg-gray-pale" />
              </div>

              <button
                onClick={() => setStatus('building')}
                className="w-full bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest py-3.5 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Start building →
              </button>
            </div>
          </div>
        )}

        {status === 'building' && (
          <QuestionEngine
            steps={QUESTIONS}
            answers={answers}
            onAnswersChange={setAnswers}
            onComplete={save}
            finishLabel="Create profile"
          />
        )}

        {status === 'saving' && (
          <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-2 border-purple/30 border-t-purple animate-spin mb-5" />
            <h1 className="font-serif text-2xl text-ink">Creating your profile…</h1>
          </div>
        )}

        {status === 'error' && (
          <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">😕</div>
            <h1 className="font-serif text-2xl md:text-3xl text-ink">That didn&apos;t save</h1>
            <p className="mt-2 text-ink2 font-light max-w-sm text-sm">
              {saveError} Your answers are safe — try again.
            </p>
            <button
              onClick={() => save(answers)}
              className="mt-6 bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest px-7 py-3 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </>
  );
}
