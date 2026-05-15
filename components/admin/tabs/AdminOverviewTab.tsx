'use client';

import Link from 'next/link';
import type { AdminData } from '@/app/admin/page';

export default function AdminOverviewTab({ data }: { data: AdminData }) {
  const stats = [
    { label: 'Total dancers', value: data.totals.dancers },
    { label: 'Published', value: data.totals.published },
    { label: 'Bookings', value: data.totals.bookings },
    { label: 'Profile views', value: data.totals.views },
  ];
  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="text-[0.6rem] tracking-[0.22em] uppercase text-purple-light/70 mb-2">Overview</div>
        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          What&apos;s happening <span className="italic text-mint">today.</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1a1625] border border-white/10 rounded-2xl p-5">
            <div className="text-[0.55rem] tracking-[0.2em] uppercase text-white/50 mb-2">{s.label}</div>
            <div className="font-serif text-3xl md:text-4xl text-white leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Recent signups">
          {data.recentDancers.length === 0 ? (
            <Empty>No dancers yet.</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recentDancers.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{d.display_name}</div>
                    <div className="text-[0.7rem] text-white/50">@{d.handle}</div>
                  </div>
                  <span className="text-[0.65rem] uppercase tracking-widest text-white/40 whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent bookings">
          {data.recentBookings.length === 0 ? (
            <Empty>No bookings yet.</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <div className="text-sm truncate">
                      {b.client_name} <span className="text-white/40">·</span> {b.gig_type || '—'}
                    </div>
                    <div className="text-[0.7rem] text-white/50 truncate">{b.client_email}</div>
                  </div>
                  <span className="text-[0.65rem] uppercase tracking-widest text-white/40 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Link
        href="/"
        className="self-start text-[0.7rem] tracking-widest text-purple-light/70 hover:text-mint underline underline-offset-4"
      >
        ← back to site
      </Link>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1625] border border-white/10 rounded-2xl p-5">
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-purple-light/70 mb-4">{title}</div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-white/40">{children}</div>;
}
