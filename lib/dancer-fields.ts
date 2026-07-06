// Single shared source of truth for editable dancer profile fields.
// Imported by BOTH the dashboard profile editor and (going forward) the onboarding
// wizard save, so the two surfaces can never edit a divergent set of columns.
//
// SECURITY: `EDITABLE_DANCER_COLUMNS` is the client-writable whitelist. Compliance-
// sensitive columns (guardian cosign, NIL verification, ownership) are intentionally
// absent — they are additionally enforced admin-only at the data layer by the
// `dancers_guard_protected_columns` trigger (see migration). The whitelist here is
// defense-in-depth so the client never even attempts to write a protected column.

export const STYLE_OPTIONS = [
  'Contemporary',
  'Jazz',
  'Hip-Hop',
  'Ballet',
  'Tap',
  'Lyrical',
  'Pom/Dance Team',
  'Hip-Hop Team',
  'Acro',
  'Cheer',
  'Ballroom',
  'Other',
] as const;

/** Columns a logged-in dancer may write to their own `dancers` row. */
export const EDITABLE_DANCER_COLUMNS = [
  'display_name',
  'location',
  'bio',
  'avatar_url',
  'years_experience',
  'instagram',
  'tiktok',
  'of_handle',
  'nil_state',
  'nil_status',
  'grad_year',
  'team_studio',
  'height',
  'video_url',
  'guardian_name',
  'guardian_email',
  'is_published',
] as const;

export type EditableDancerColumn = (typeof EDITABLE_DANCER_COLUMNS)[number];

/** Columns only an admin can change (blocked for dancers by the DB trigger). Shown read-only. */
export const PROTECTED_DANCER_COLUMNS = [
  'requires_guardian_cosign',
  'guardian_cosign_confirmed',
  'nil_verified',
  'user_id',
  'handle',
] as const;

/**
 * Strip any non-whitelisted keys from an update patch before it hits Supabase.
 * The DB trigger is the real guard; this keeps the client from sending columns
 * it isn't allowed to write (which would fail the whole UPDATE).
 */
export function pickEditableDancerColumns(
  patch: Record<string, unknown>,
): Partial<Record<EditableDancerColumn, unknown>> {
  const out: Partial<Record<EditableDancerColumn, unknown>> = {};
  for (const key of EDITABLE_DANCER_COLUMNS) {
    if (key in patch) out[key] = patch[key];
  }
  return out;
}

export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'select' | 'styles';

export interface DancerField {
  /** `dancers` column, or the pseudo-column 'styles' (child table dancer_styles). */
  column: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  maxLength?: number;
  options?: readonly string[];
}

export interface ProfileSection {
  id: string;
  title: string;
  /** True when this section writes the dancer_styles child table instead of a column. */
  childTable?: 'dancer_styles';
  fields: DancerField[];
}

/** Sections rendered as summary-cards-with-Edit on the dashboard Profile tab. */
export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'identity',
    title: 'Identity',
    fields: [
      { column: 'display_name', label: 'Display name', type: 'text', placeholder: 'Jasmine Carter' },
      { column: 'team_studio', label: 'Team / Studio', type: 'text', placeholder: 'Elite Dance Academy' },
      { column: 'location', label: 'Location', type: 'text', placeholder: 'St. Louis, MO' },
      { column: 'grad_year', label: 'Graduation year', type: 'number', placeholder: '2027' },
      { column: 'height', label: 'Height', type: 'text', placeholder: `5'6"` },
    ],
  },
  {
    id: 'about',
    title: 'About',
    fields: [
      {
        column: 'bio',
        label: 'Bio',
        type: 'textarea',
        maxLength: 300,
        placeholder: 'What makes you stand out…',
      },
    ],
  },
  {
    id: 'styles',
    title: 'Dance styles',
    childTable: 'dancer_styles',
    fields: [{ column: 'styles', label: 'Styles', type: 'styles', options: STYLE_OPTIONS }],
  },
  {
    id: 'video',
    title: 'Recruiting video',
    fields: [
      {
        column: 'video_url',
        label: 'Video link',
        type: 'url',
        placeholder: 'https://youtube.com/watch?v=…',
        help: 'YouTube or Vimeo',
      },
    ],
  },
  // Special-cased in ProfileTab (renders SocialLinksCard, backed by dancer_social_links).
  { id: 'social', title: 'Social links', fields: [] },
  // Special-cased in ProfileTab (renders ReelCard, backed by dancer_reel_videos).
  { id: 'reel', title: 'Video reel', fields: [] },
  {
    id: 'stats',
    title: 'Experience',
    fields: [
      { column: 'years_experience', label: 'Years of experience', type: 'number', placeholder: '5' },
    ],
  },
];

// Re-exported from the shared video module so the dashboard and wizard use one validator.
export { isValidVideoUrl } from './video';
