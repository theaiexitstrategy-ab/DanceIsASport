// Shared config + validation for dancer social links (manual entry, Phase 1).
// The dancer_social_links table stores one row per (dancer, platform) with
// connection_type='manual'. Phase 2 can add connection_type='oauth' rows +
// nullable token columns without restructuring any of this.

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitch';

export interface SocialPlatformConfig {
  key: SocialPlatform;
  label: string;
  placeholder: string;
  /** Domains that a pasted URL for this platform is expected to contain. */
  domains: string[];
}

// Order here is the canonical display order (dashboard rows + public link-tree).
export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  { key: 'instagram', label: 'Instagram', placeholder: '@handle or instagram.com/…', domains: ['instagram.com'] },
  { key: 'tiktok', label: 'TikTok', placeholder: '@handle or tiktok.com/@…', domains: ['tiktok.com'] },
  { key: 'youtube', label: 'YouTube', placeholder: '@handle or youtube.com/…', domains: ['youtube.com', 'youtu.be'] },
  { key: 'twitch', label: 'Twitch', placeholder: 'handle or twitch.tv/…', domains: ['twitch.tv'] },
];

/**
 * Loose sanity check: accept a plain handle (with or without @) for any platform,
 * or a URL that actually points at that platform's domain. Reject obviously-wrong
 * input (a URL for a different platform, spaces, junk) without being pedantic.
 */
export function isValidSocial(platform: SocialPlatform, raw: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  if (/\s/.test(v)) return false;

  const looksLikeUrl = /^https?:\/\//i.test(v) || /^www\./i.test(v) || /\.[a-z]{2,}(\/|$)/i.test(v);
  if (looksLikeUrl) {
    const lower = v.toLowerCase();
    const domains = SOCIAL_PLATFORMS.find((p) => p.key === platform)?.domains ?? [];
    return domains.some((d) => lower.includes(d));
  }
  // Plain handle.
  return /^@?[A-Za-z0-9_.\-]{1,64}$/.test(v);
}

/** Build the outbound URL for a link-tree icon from a stored handle-or-URL. */
export function toSocialUrl(platform: SocialPlatform | string, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  if (/\.[a-z]{2,}\//i.test(v)) return `https://${v}`; // bare-domain URL, no scheme
  const handle = v.replace(/^@/, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'youtube':
      return `https://youtube.com/@${handle}`;
    case 'twitch':
      return `https://twitch.tv/${handle}`;
    default:
      return v;
  }
}

export function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.key === platform)?.label ?? platform;
}
