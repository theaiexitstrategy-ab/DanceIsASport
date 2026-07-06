// Monochrome brand icons (use currentColor) for social links + reel platform tags.
// Plain SVG components — safe in both server and client components.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.35 2.1 1.6 3.55 3.5 3.82v2.63c-1.28 0-2.5-.4-3.5-1.05v6.35A5.7 5.7 0 1 1 10.8 9.1c.3 0 .6.02.9.07v2.73a2.9 2.9 0 1 0 2 2.77V3h2.8z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.77-1.78C19.32 5.1 12 5.1 12 5.1s-7.32 0-8.83.42A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.77 1.78C4.68 18.9 12 18.9 12 18.9s7.32 0 8.83-.42A2.5 2.5 0 0 0 22.6 16.7C23 15.2 23 12 23 12zM9.75 14.85V9.15L14.7 12l-4.95 2.85z" />
    </svg>
  );
}

export function TwitchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 3 3 6.2V18h4v3h3l3-3h4l4-4V3H4zm2 2h13v8l-2.2 2.2h-4L10 18.2V15.2H6V5zm5 2.9v4.2h2V7.9h-2zm5 0v4.2h2V7.9h-2z" />
    </svg>
  );
}

export function VimeoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 7.4c-.1 2.1-1.6 5-4.4 8.6-2.9 3.8-5.4 5.7-7.4 5.7-1.24 0-2.3-1.15-3.16-3.45L5.3 11.3C4.65 9 3.96 7.85 3.2 7.85c-.16 0-.74.35-1.72 1.05L.5 7.5c1.1-.97 2.18-1.94 3.24-2.9 1.46-1.27 2.56-1.94 3.3-2 1.72-.17 2.78 1 3.18 3.53.43 2.72.73 4.4.9 5.06.5 2.26 1.03 3.4 1.62 3.4.46 0 1.15-.72 2.07-2.17.92-1.45 1.4-2.55 1.47-3.3.13-1.27-.37-1.9-1.47-1.9-.52 0-1.06.12-1.6.36 1.08-3.54 3.15-5.26 6.2-5.16 2.26.06 3.32 1.53 3.2 4.4z" />
    </svg>
  );
}

export type { IconProps };
