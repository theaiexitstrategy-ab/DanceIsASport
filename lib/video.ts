// Single source of truth for recruiting-video link validation + embedding.
// Reused by: the onboarding wizard media-link input (questions.ts), the dashboard
// video editor (ProfileTab), and the public profile embed (app/[handle]/page.tsx).

const YOUTUBE_VIMEO =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|vimeo\.com\/)[\w-]+/i;

/** True when the URL is a recognizable YouTube or Vimeo link. */
export function isValidVideoUrl(url: string): boolean {
  return YOUTUBE_VIMEO.test(url.trim());
}

/** Convert a YouTube/Vimeo watch URL into an embeddable player URL, or null if unrecognized. */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/* -------------------------- Short-form reel videos ------------------------- */
// The reel accepts platform-native short-form content, so it extends the
// YouTube/Vimeo validation with Instagram Reels + TikTok video URLs.

export type ReelPlatform = 'youtube' | 'vimeo' | 'instagram' | 'tiktok';

/** Infer the platform of a reel video URL, or null if it isn't a recognized one. */
export function inferReelPlatform(url: string): ReelPlatform | null {
  const u = url.trim().toLowerCase();
  if (/(?:youtube\.com|youtu\.be)/.test(u)) return 'youtube';
  if (/vimeo\.com/.test(u)) return 'vimeo';
  if (/instagram\.com\/(?:reel|reels|p|tv)\//.test(u)) return 'instagram';
  if (/(?:tiktok\.com\/.+\/video\/\d+|vm\.tiktok\.com\/|tiktok\.com\/t\/)/.test(u)) return 'tiktok';
  return null;
}

/** Loose validity check for a reel video link (YouTube, Vimeo, Instagram Reel, or TikTok). */
export function isValidReelUrl(url: string): boolean {
  return inferReelPlatform(url) !== null;
}

/**
 * For a reel entry, decide how the public page should render it:
 *  - 'embed' with an embedUrl for YouTube/Vimeo (inline player)
 *  - 'link' for Instagram/TikTok (styled card that opens in a new tab)
 */
export function resolveReel(url: string): {
  platform: ReelPlatform | null;
  kind: 'embed' | 'link';
  embedUrl: string | null;
} {
  const platform = inferReelPlatform(url);
  const embedUrl = toEmbedUrl(url); // only non-null for YouTube/Vimeo
  return { platform, kind: embedUrl ? 'embed' : 'link', embedUrl };
}
