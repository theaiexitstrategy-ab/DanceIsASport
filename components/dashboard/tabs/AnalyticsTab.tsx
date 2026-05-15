'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardData } from '@/app/dashboard/page';

export default function AnalyticsTab({ data }: { data: DashboardData }) {
  const stats = [
    { label: 'Views (7d)', value: data.totalViews, int: true },
    { label: 'Bookings', value: data.bookings.length, int: true },
    { label: 'Services', value: data.services.length, int: true },
    { label: 'Media', value: data.media.length, int: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} int={s.int} />
        ))}
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-1">Profile views</div>
            <div className="font-serif text-2xl text-ink">Last 7 days</div>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.viewsLast7} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cbf" />
                  <stop offset="100%" stopColor="#5bbfa0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#7a7585" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#7a7585" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(124,92,191,0.2)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                cursor={{ fill: 'rgba(124,92,191,0.06)' }}
              />
              <Bar dataKey="views" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">Top referrer</div>
        <TopReferrer data={data} />
      </div>
    </div>
  );
}

function StatCard({ label, value, int }: { label: string; value: number; int: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setN(value * ease);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-2xl p-4 md:p-5">
      <div className="text-[0.55rem] tracking-[0.18em] uppercase text-gray mb-2">{label}</div>
      <div className="font-serif text-3xl md:text-4xl text-purple leading-none">
        {int ? Math.floor(n) : n.toFixed(1)}
      </div>
    </div>
  );
}

function TopReferrer({ data: _data }: { data: DashboardData }) {
  // Until we accumulate referrer rows in profile_views, show a stub
  return (
    <div className="text-ink2 text-sm leading-relaxed">
      We&apos;ll start tracking where your views come from after your next 10 visits. Share your profile and check back.
    </div>
  );
}
