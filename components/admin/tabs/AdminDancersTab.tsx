'use client';

import { useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { AdminData } from '@/app/admin/page';
import type { Dancer } from '@/lib/database.types';

export default function AdminDancersTab({ data, onRefresh }: { data: AdminData; onRefresh: (p: Partial<AdminData>) => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [nilFilter, setNilFilter] = useState<string>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const nilOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data.allDancers
            .map((d) => d.nil_status)
            .filter((x): x is string => Boolean(x)),
        ),
      ),
    [data.allDancers],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.allDancers.filter((d) => {
      if (statusFilter === 'published' && !d.is_published) return false;
      if (statusFilter === 'draft' && d.is_published) return false;
      if (nilFilter !== 'all' && d.nil_status !== nilFilter) return false;
      if (q) {
        const hay = `${d.display_name} ${d.handle} ${d.location || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.allDancers, search, statusFilter, nilFilter]);

  async function togglePublish(d: Dancer) {
    setBusy(d.id);
    const sb = getSupabaseBrowser();
    const next = !d.is_published;
    const { error } = await sb.from('dancers').update({ is_published: next }).eq('id', d.id);
    setBusy(null);
    if (!error) {
      onRefresh({
        allDancers: data.allDancers.map((x) => (x.id === d.id ? { ...x, is_published: next } : x)),
      });
    }
  }

  async function del(d: Dancer) {
    if (!confirm(`Delete ${d.display_name}? This removes the dancer and all related rows.`)) return;
    setBusy(d.id);
    const sb = getSupabaseBrowser();
    const { error } = await sb.from('dancers').delete().eq('id', d.id);
    setBusy(null);
    if (!error) {
      onRefresh({ allDancers: data.allDancers.filter((x) => x.id !== d.id) });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[0.6rem] tracking-[0.22em] uppercase text-purple-light/70 mb-2">Dancers</div>
        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          {filtered.length}
          <span className="text-white/30"> / {data.allDancers.length}</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 items-center bg-[#1a1625] border border-white/10 rounded-2xl p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, handle, location…"
          className="flex-1 min-w-[200px] bg-[#0f0d14] border border-white/10 text-white px-3.5 py-2 rounded-lg text-sm outline-none focus:border-purple/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={nilFilter}
          onChange={(e) => setNilFilter(e.target.value)}
          className="bg-[#0f0d14] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none"
        >
          <option value="all">All NIL</option>
          {nilOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[#1a1625] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[0.6rem] uppercase tracking-widest text-white/50">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Location</th>
                <th className="text-left py-3 px-4 font-medium">NIL</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Joined</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/40">
                    No dancers match.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-medium">{d.display_name}</div>
                      <div className="text-[0.7rem] text-white/40">@{d.handle}</div>
                    </td>
                    <td className="py-3 px-4 text-white/70">{d.location || '—'}</td>
                    <td className="py-3 px-4 text-white/70 text-xs">{d.nil_status || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[0.55rem] uppercase tracking-widest px-2 py-1 rounded-full ${
                          d.is_published
                            ? 'bg-mint/20 text-mint border border-mint/30'
                            : 'bg-white/10 text-white/60 border border-white/15'
                        }`}
                      >
                        {d.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/50 text-xs whitespace-nowrap">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        href={`/${d.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-light/80 hover:text-mint mr-2"
                      >
                        View
                      </a>
                      <button
                        disabled={busy === d.id}
                        onClick={() => togglePublish(d)}
                        className="text-xs text-purple-light/80 hover:text-mint mr-2 disabled:opacity-50"
                      >
                        {d.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        disabled={busy === d.id}
                        onClick={() => del(d)}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
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
