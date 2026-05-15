'use client';

import { useMemo, useState } from 'react';
import type { DashboardData } from '@/app/dashboard/page';

// Placeholder Printful product page — replace once a real product is wired up
const PRINTFUL_PRODUCT_URL =
  'https://www.printful.com/custom/men/short-sleeve-t-shirt/print-on-demand-mens-graphic-tee';

export default function MerchTab({ data }: { data: DashboardData }) {
  const profileUrl = useMemo(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.origin}/${data.dancer.handle}`
        : `https://danceisasport.com/${data.dancer.handle}`,
    [data.dancer.handle],
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=10&data=${encodeURIComponent(profileUrl)}`;
  const [copied, setCopied] = useState(false);

  async function shareImg() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${data.dancer.display_name} on Dance Is A Sport`, url: profileUrl });
      } catch {
        /* user cancelled */
      }
      return;
    }
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8">
      <div className="bg-gradient-to-br from-ink to-purple/90 text-white rounded-3xl overflow-hidden p-6 md:p-8 relative">
        <div className="absolute -top-20 -right-10 w-60 h-60 rounded-full bg-mint/20 blur-3xl pointer-events-none" />
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-mint mb-3">Your signature tee</div>
        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-3">
          Wear your QR.<br />
          <span className="italic text-mint-light">Get booked everywhere.</span>
        </h2>
        <p className="text-white/75 text-sm leading-relaxed max-w-md">
          Every Dance Is A Sport tee carries your unique QR code on the back. Class, audition, function — your bookings
          page is one scan away.
        </p>

        <div className="relative mt-7 mb-2 flex justify-center">
          <div className="relative w-[200px] md:w-[240px] aspect-[3/4]">
            <svg viewBox="0 0 300 360" className="w-full h-full">
              <path
                d="M70 60 L120 30 C130 50 170 50 180 30 L230 60 L260 100 L230 130 L210 110 L210 320 L90 320 L90 110 L70 130 L40 100 Z"
                fill="#0f0d14"
              />
            </svg>
            <div className="absolute top-[28%] left-1/2 -translate-x-1/2 font-serif text-white text-[0.65rem] md:text-xs tracking-[0.25em]">
              DanceIsASport
            </div>
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[40%] aspect-square bg-white rounded-md p-1 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR" className="w-full h-full" />
            </div>
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-white/70 text-[0.55rem] tracking-[0.3em] uppercase">
              scan me
            </div>
          </div>
        </div>

        <a
          href={PRINTFUL_PRODUCT_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block w-full bg-white text-ink font-serif tracking-widest text-center py-3.5 rounded-xl active:scale-[0.98] hover:bg-mint-pale transition-all"
        >
          Order My Shirt →
        </a>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">Your QR</div>
          <div className="flex justify-center bg-bg rounded-2xl p-4 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR code" className="w-44 h-44 rounded-xl bg-white p-2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={qrUrl}
              download={`${data.dancer.handle}-qr.png`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-purple text-white text-center font-serif tracking-widest text-sm py-3 rounded-xl active:scale-95 shadow-purple-soft hover:shadow-purple-lift transition-all"
            >
              Download
            </a>
            <button
              onClick={shareImg}
              className="flex-1 bg-white border border-purple/30 text-purple font-serif tracking-widest text-sm py-3 rounded-xl active:scale-95 transition-all"
            >
              {copied ? 'Copied ✓' : 'Share QR'}
            </button>
          </div>
        </div>

        <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">Coming soon</div>
          <div className="font-serif text-2xl text-ink leading-tight mb-2">
            Hoodies. Tees. Hats. <span className="italic text-mint">All you.</span>
          </div>
          <p className="text-ink2 text-sm leading-relaxed">
            Earn a cut every time someone scans your tee and books you. Drop your suggestions in Settings → Feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
