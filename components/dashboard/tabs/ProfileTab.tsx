'use client';

import { useMemo, useState } from 'react';
import type { DashboardData } from '@/app/dashboard/page';

export default function ProfileTab({ data, onRefresh: _onRefresh }: { data: DashboardData; onRefresh: (p: Partial<DashboardData>) => void }) {
  const [showQR, setShowQR] = useState(false);
  const profileUrl = useMemo(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.origin}/${data.dancer.handle}`
        : `https://danceisasport.com/${data.dancer.handle}`,
    [data.dancer.handle],
  );

  const completion = useMemo(() => {
    const fields = [
      data.dancer.avatar_url,
      data.dancer.bio,
      data.dancer.location,
      data.dancer.years_experience !== null,
      data.dancer.instagram,
      data.dancer.tiktok,
      data.styles.length > 0,
      data.services.length > 0,
      data.media.length > 0,
      data.dancer.nil_state,
      data.dancer.nil_status,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [data]);

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">Your link</div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 bg-purple-pale rounded-xl px-4 py-3 font-mono text-sm text-purple truncate">
            {profileUrl}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="bg-purple text-white px-5 py-3 rounded-xl text-sm font-serif tracking-widest active:scale-95 hover:shadow-purple-soft transition-all"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button
              onClick={() => setShowQR((s) => !s)}
              className="bg-white border border-purple/30 text-purple px-5 py-3 rounded-xl text-sm font-serif tracking-widest active:scale-95 transition-all"
            >
              {showQR ? 'Hide QR' : 'QR'}
            </button>
            <a
              href={`/${data.dancer.handle}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center bg-white border border-purple/30 text-purple px-5 py-3 rounded-xl text-sm font-serif tracking-widest active:scale-95"
            >
              Open ↗
            </a>
          </div>
        </div>
        {showQR && (
          <div className="mt-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="QR code"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}`}
              className="rounded-xl border border-purple/15 bg-white p-2"
            />
          </div>
        )}
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-1">Completion</div>
            <div className="font-serif text-3xl text-ink">{completion}%</div>
          </div>
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('dashboard:gotoTab', { detail: 'settings' }));
            }}
            className="text-xs text-purple underline underline-offset-2"
          >
            Complete profile →
          </a>
        </div>
        <div className="h-2.5 bg-purple-pale rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple to-mint transition-[width] duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl overflow-hidden">
        <div className="px-6 md:px-7 pt-6 pb-4 flex items-center justify-between">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid">Live preview</div>
          <a
            href={`/${data.dancer.handle}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple"
          >
            Open in new tab →
          </a>
        </div>
        <div className="relative bg-bg border-t border-purple/10">
          <iframe
            src={`/${data.dancer.handle}`}
            title="Public profile preview"
            className="w-full h-[640px]"
          />
        </div>
      </div>
    </div>
  );
}
