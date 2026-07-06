// Onboarding wizard question configuration.
// Copy, order, and validation live here so the QuestionEngine stays logic-only.
// Each `field` key is the answers-object key and maps to a dancers/child-table column in Prompt 4.

import { isValidVideoUrl } from '@/lib/video';

export type InputType =
  | 'chips-single' // tappable pills, single-select, auto-advances on tap
  | 'chips-multi' // tappable pills, multi-select, requires Next
  | 'text-short' // single-line input
  | 'text-long' // textarea
  | 'media-link'; // YouTube/Vimeo URL with inline validation

export interface QuestionOption {
  label: string;
  value: string;
}

// The evolving answers object. Values are string (text/single-chip) or string[] (multi-chip).
export type Answers = Record<string, string | string[]>;

export interface QuestionStep {
  id: string;
  /** answers-object key + eventual DB column mapping */
  field: string;
  question: string;
  subtext?: string;
  type: InputType;
  placeholder?: string;
  /** Static options, or a function of prior answers (used for "additional styles minus primary"). */
  options?: QuestionOption[] | ((answers: Answers) => QuestionOption[]);
  /** Allow the step to be skipped entirely. */
  optional?: boolean;
  /** Character cap for text-long (shows a live counter). */
  maxLength?: number;
  /** Returns an error string if invalid, otherwise null. */
  validate?: (value: string | string[], answers: Answers) => string | null;
}

const DANCE_STYLES = [
  'Contemporary',
  'Jazz',
  'Hip-Hop',
  'Ballet',
  'Tap',
  'Pom/Dance Team',
  'Other',
];

function toOptions(values: string[]): QuestionOption[] {
  return values.map((v) => ({ label: v, value: v }));
}

/** Graduation years: current year through +4. Computed at call time (browser). */
function gradYearOptions(): QuestionOption[] {
  const now = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const y = String(now + i);
    return { label: y, value: y };
  });
}

function requiredText(msg: string) {
  return (value: string | string[]) => {
    const v = typeof value === 'string' ? value.trim() : '';
    return v.length ? null : msg;
  };
}

export const QUESTIONS: QuestionStep[] = [
  {
    id: 'first-name',
    field: 'first_name',
    question: "What's your first name?",
    type: 'text-short',
    placeholder: 'Jasmine',
    validate: requiredText('First name is required'),
  },
  {
    id: 'last-name',
    field: 'last_name',
    question: 'And your last name?',
    type: 'text-short',
    placeholder: 'Carter',
    validate: requiredText('Last name is required'),
  },
  {
    id: 'grad-year',
    field: 'grad_year',
    question: 'When do you graduate?',
    subtext: 'Your high school or college graduation year.',
    type: 'chips-single',
    options: gradYearOptions,
  },
  {
    id: 'primary-style',
    field: 'primary_style',
    question: "What's your primary dance style?",
    type: 'chips-single',
    options: toOptions(DANCE_STYLES),
  },
  {
    id: 'additional-styles',
    field: 'additional_styles',
    question: 'Any other styles you train in?',
    subtext: 'Pick as many as you like, then tap Next.',
    type: 'chips-multi',
    // Same list, minus whatever was chosen as the primary style.
    options: (answers) => {
      const primary = answers.primary_style;
      return toOptions(DANCE_STYLES.filter((s) => s !== primary));
    },
    optional: true,
  },
  {
    id: 'team-studio',
    field: 'team_studio',
    question: "What's your current team or studio?",
    type: 'text-short',
    placeholder: 'Elite Dance Academy',
    validate: requiredText('Team or studio is required'),
  },
  {
    id: 'location',
    field: 'location',
    question: 'Where are you based?',
    subtext: 'City & state.',
    type: 'text-short',
    placeholder: 'St. Louis, MO',
    validate: requiredText('Location is required'),
  },
  {
    id: 'height',
    field: 'height',
    question: 'How tall are you?',
    subtext: 'e.g. 5\'6"',
    type: 'text-short',
    placeholder: '5\'6"',
    validate: requiredText('Height is required'),
  },
  {
    id: 'experience',
    field: 'experience',
    question: 'Years of competitive experience?',
    type: 'chips-single',
    options: toOptions(['<1', '1-2', '3-4', '5+']),
  },
  {
    id: 'instagram',
    field: 'instagram',
    question: "What's your Instagram? (optional)",
    subtext: 'Skip if you\'d rather not link it.',
    type: 'text-short',
    placeholder: '@jasmine.dances',
    optional: true,
  },
  {
    id: 'video',
    field: 'video_url',
    question: 'Drop your recruiting video link',
    subtext: 'NDCA-standard format preferred, YouTube unlisted or Vimeo.',
    type: 'media-link',
    placeholder: 'https://youtube.com/watch?v=…',
    validate: (value) => {
      const v = typeof value === 'string' ? value.trim() : '';
      if (!v) return 'A recruiting video link is required';
      return isValidVideoUrl(v) ? null : 'Enter a valid YouTube or Vimeo link';
    },
  },
  {
    id: 'bio',
    field: 'bio',
    question: 'What makes you stand out?',
    subtext: 'A short bio recruiters and clients will read first.',
    type: 'text-long',
    maxLength: 300,
    placeholder: 'Three-time regional champion with a background in…',
    validate: requiredText('Tell us a little about yourself'),
  },
];
