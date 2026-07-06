'use client';

// Interactive single-question-at-a-time onboarding wizard.
// Replaces the old 4-step scrolling form (see git history / commit d5d8720).
// Prompt 1: engine + question config only. The live preview card (Prompt 2),
// guardian branch (Prompt 3) and Supabase save (Prompt 4) are layered on next.

import { useState } from 'react';
import Nav from '@/components/Nav';
import Particles from '@/components/Particles';
import QuestionEngine from './QuestionEngine';
import { QUESTIONS, type Answers } from './questions';

export default function OnboardPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  function handleComplete(final: Answers) {
    // Prompt 4 wires the Supabase save here. For now, log the clean answers object.
    // eslint-disable-next-line no-console
    console.log('Onboarding answers:', final);
    setDone(true);
  }

  return (
    <>
      <Particles count={35} />
      <Nav />
      <main className="relative z-[1] max-w-2xl mx-auto px-5 md:px-8">
        {done ? (
          <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">✨</div>
            <h1 className="font-serif text-3xl md:text-4xl text-ink">You're all set!</h1>
            <p className="mt-3 text-ink2 font-light max-w-sm">
              Your answers are captured. (Saving your profile comes next — check the console for
              the collected data.)
            </p>
          </div>
        ) : (
          <QuestionEngine
            steps={QUESTIONS}
            answers={answers}
            onAnswersChange={setAnswers}
            onComplete={handleComplete}
          />
        )}
      </main>
    </>
  );
}
