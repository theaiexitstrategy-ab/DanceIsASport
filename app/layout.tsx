import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import Toaster from '@/components/ui/Toaster';
import PageTransition from '@/components/ui/PageTransition';
import ThemeManager from '@/components/ui/ThemeManager';
import InstallPrompt from '@/components/ui/InstallPrompt';
import SwRegister from '@/components/ui/SwRegister';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://danceisasport.com'),
  title: { default: 'Dance Is A Sport — Dancer Marketplace', template: '%s · Dance Is A Sport' },
  description:
    'The dancer profile + booking marketplace. NIL-verified, privacy-protected. Get discovered, get booked, get paid.',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Dance Is A Sport',
    title: 'Dance Is A Sport — Dancer Marketplace',
    description: 'NIL-verified. Privacy-protected. Built for dancers, by dancers.',
  },
  twitter: { card: 'summary_large_image', title: 'Dance Is A Sport', description: 'Get discovered. Get booked.' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c5cbf' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0d14' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <ThemeManager />
        <Toaster>
          <PageTransition>{children}</PageTransition>
        </Toaster>
        <InstallPrompt />
        <SwRegister />
      </body>
    </html>
  );
}
