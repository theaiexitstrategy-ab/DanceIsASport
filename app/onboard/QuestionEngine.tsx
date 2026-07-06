'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Answers, QuestionOption, QuestionStep } from './questions';

function resolveOptions(step: QuestionStep, answers: Answers): QuestionOption[] {
  if (!step.options) return [];
  return typeof step.options === 'function' ? step.options(answers) : step.options;
}

export interface QuestionEngineProps {
  steps: QuestionStep[];
  answers: Answers;
  onAnswersChange: (answers: Answers) => void;
  /** Called once with the final answers object when the last step is submitted. */
  onComplete: (answers: Answers) => void;
  /** Fired whenever the active step index changes (used by the live preview / peek strip). */
  onStepChange?: (index: number, step: QuestionStep) => void;
  /** Optional label for the terminal button (defaults to "Finish"). */
  finishLabel?: string;
}

export default function QuestionEngine({
  steps,
  answers,
  onAnswersChange,
  onComplete,
  onStepChange,
  finishLabel = 'Finish',
}: QuestionEngineProps) {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const value = answers[step.field] ?? (step.type === 'chips-multi' ? [] : '');

  const options = useMemo(() => resolveOptions(step, answers), [step, answers]);

  function setValue(next: string | string[]) {
    onAnswersChange({ ...answers, [step.field]: next });
    if (error) setError(null);
  }

  function goTo(nextIndex: number, dir: number) {
    setDirection(dir);
    setError(null);
    setIndex(nextIndex);
    onStepChange?.(nextIndex, steps[nextIndex]);
  }

  function validateCurrent(): boolean {
    if (step.validate) {
      const err = step.validate(value, answers);
      if (err) {
        setError(err);
        return false;
      }
    }
    return true;
  }

  function advance() {
    if (!validateCurrent()) return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    goTo(index + 1, 1);
  }

  function back() {
    if (index === 0) return;
    goTo(index - 1, -1);
  }

  // chips-single: record answer and auto-advance (or complete if last).
  function pickSingle(optionValue: string) {
    const nextAnswers = { ...answers, [step.field]: optionValue };
    onAnswersChange(nextAnswers);
    setError(null);
    if (isLast) {
      onComplete(nextAnswers);
    } else {
      goTo(index + 1, 1);
    }
  }

  function toggleMulti(optionValue: string) {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    setValue(next);
  }

  return (
    <div className="flex flex-col min-h-[100dvh] md:min-h-0 md:h-full">
      {/* Progress */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-2 text-[0.62rem] tracking-[0.18em] uppercase text-gray">
          <span className="text-purple">
            Step {index + 1} of {steps.length}
          </span>
          {step.optional && <span className="text-gray-light">Optional</span>}
        </div>
        <div className="h-1.5 bg-purple-pale rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple to-mint"
            initial={false}
            animate={{ width: `${((index + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-3xl md:text-4xl leading-tight text-ink">
              {step.question}
            </h1>
            {step.subtext && (
              <p className="mt-2 text-sm text-ink2 font-light">{step.subtext}</p>
            )}

            <div className="mt-7">
              {(step.type === 'chips-single' || step.type === 'chips-multi') && (
                <div className="flex flex-wrap gap-2.5">
                  {options.map((opt) => {
                    const active =
                      step.type === 'chips-multi'
                        ? Array.isArray(value) && value.includes(opt.value)
                        : value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          step.type === 'chips-multi'
                            ? toggleMulti(opt.value)
                            : pickSingle(opt.value)
                        }
                        className={`text-sm tracking-wide px-4 py-2.5 rounded-full border transition-all active:scale-95 ${
                          active
                            ? 'bg-purple text-white border-purple shadow-purple-soft'
                            : 'bg-purple-pale text-purple border-purple/20 hover:-translate-y-0.5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === 'text-short' && (
                <input
                  autoFocus
                  className={inputCls}
                  placeholder={step.placeholder}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && advance()}
                />
              )}

              {step.type === 'media-link' && (
                <input
                  autoFocus
                  type="url"
                  inputMode="url"
                  className={inputCls}
                  placeholder={step.placeholder}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && advance()}
                />
              )}

              {step.type === 'text-long' && (
                <div>
                  <textarea
                    autoFocus
                    className={inputCls + ' min-h-[140px] resize-y'}
                    placeholder={step.placeholder}
                    maxLength={step.maxLength}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  {step.maxLength && (
                    <div className="mt-1.5 text-right text-[0.7rem] text-gray-light tabular-nums">
                      {(typeof value === 'string' ? value.length : 0)}/{step.maxLength}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pb-8">
        {index > 0 && (
          <button
            onClick={back}
            className="px-5 py-3 text-gray border border-gray-pale rounded-xl text-sm hover:text-ink hover:border-gray transition-all active:scale-95"
          >
            Back
          </button>
        )}

        {/* chips-single auto-advances, so it shows no primary button (only optional skip). */}
        {step.type === 'chips-single' ? (
          step.optional && !isLast ? (
            <button
              onClick={() => goTo(index + 1, 1)}
              className="ml-auto text-sm text-gray hover:text-ink transition-all active:scale-95"
            >
              Skip →
            </button>
          ) : null
        ) : (
          <div className="ml-auto flex items-center gap-3">
            {step.optional && (
              <button
                onClick={advance}
                className="text-sm text-gray hover:text-ink transition-all active:scale-95"
              >
                Skip
              </button>
            )}
            <button
              onClick={advance}
              className="bg-gradient-to-br from-purple to-purple-mid text-white px-7 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 transition-all active:scale-95"
            >
              {isLast ? finishLabel : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-bg border border-gray-pale text-ink px-4 py-3.5 font-sans text-base font-light outline-none rounded-xl transition-all focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)]';
