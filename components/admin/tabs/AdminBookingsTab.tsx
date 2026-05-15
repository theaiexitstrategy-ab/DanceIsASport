'use client';

import { useMemo, useState } from 'react';
import type { AdminData } from '@/app/admin/page';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-purple/20 text-purple-light border-purple/30',
  confirmed: 'bg-mint/20 text-mint border-mint/30',
  declined: 'bg-white/5 text-white/40 border-white/10',
};

export default function AdminBookingsTab({ data }: { data: AdminData }) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');
  const [gigFilter, setGigFilter] = useState<string>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const gigOptions = useMemo(
    () => Array.from(new Set(data.allBookings.map((b) => b.gig_type).filter((x): x is string => Boolean(x)))),
    [data.allBookings],
  );

  const filtered = useMemo(() => {
    return data.allBookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (gigFilter !== 'all' && b.gig_type !== gigFilter) return false;
      if (from && b.created_at < from) return false;
      if (to && b.created_at > new Date(to + 'T23:59:59').toISOString()) return false;
      return true;
    });
  }, [data.allBookings, statusFilter, gigFilter, from, to]);

  function exportCsv() {
    const headers = [
      'created_at',
      'status',
      'dancer_handle',
      'dancer_name',
      'client_name',
      'client_email',
      'gig_type',
      'event_date',
      'budget_range',
      'details',
    ];
    const escape = (s: unknown) => {
      const str = s === null || s === undefined ? '' : String(s);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const rows = filtered.map((b) =>
      [
        b.created_at,
        b.status,
        b.dancer_handle,
        b.dancer_name,
        b.client_name,
        b.client_email,
        b.gig_type,
        b.event_date,
        b.budget_range,
        b.details,
      ]
        .map(escape)
        .join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[0.6rem] tracking-[0.22em] uppercase text-purple-light/70 mb-2">Bookings</div>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
            {filtered.length}
            <span className="text-white/30"> / {data.allBookings.length}</span>
          </h1>
        </div>
        <button
          onClick={exportCsv}
          className="bg-mint text-[#0f0d14] font-serif tracking-widest text-sm px-5 py-2.5 rounded-lg active:scale-95 hover:shadow-mint-soft transition-all"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 items-center bg-[#1a1625] border border-white/10 rounded-2xl p-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'declined')}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
        </select>
        <select
          value={gigFilter}
          onChange={(e) => setGigFilter(e.target.value)}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        >
          <option value="all">All gigs</option>
          {gigOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        />
        <span className="text-white/40 text-xs">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        />
      </div>

      <div className="bg-[#1a1625] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[0.6rem] uppercase tracking-widest text-white/50">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Client</th>
                <th className="text-left py-3 px-4 font-medium">Dancer</th>
                <th className="text-left py-3 px-4 font-medium">Gig</th>
                <th className="text-left py-3 px-4 font-medium">Event</th>
                <th className="text-left py-3 px-4 font-medium">Budget</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-white/40">
                    No bookings match.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-medium">{b.client_name}</div>
                      <div className="text-[0.7rem] text-white/40">{b.client_email}</div>
                    </td>
                    <td className="py-3 px-4 text-white/70 text-xs">
                      {b.dancer_name || '—'}
                      <div className="text-[0.65rem] text-white/40">@{b.dancer_handle}</div>
                    </td>
                    <td className="py-3 px-4 text-white/70 text-xs">{b.gig_type || '—'}</td>
                    <td className="py-3 px-4 text-white/70 text-xs whitespace-nowrap">
                      {b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-white/70 text-xs">{b.budget_range || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[0.55rem] uppercase tracking-widest px-2 py-1 rounded-full border ${
                          STATUS_STYLES[b.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/50 text-xs whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
