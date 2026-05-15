'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { DashboardData } from '@/app/dashboard/page';
import type { BookingRequest } from '@/lib/database.types';

function maskName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-purple-pale text-purple border-purple/25',
  confirmed: 'bg-mint-pale text-mint border-mint/30',
  declined: 'bg-gray-pale text-gray border-gray/20',
};

export default function BookingsTab({ data, onRefresh }: { data: DashboardData; onRefresh: (p: Partial<DashboardData>) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function setStatus(b: BookingRequest, next: string) {
    setUpdating(b.id);
    const sb = getSupabaseBrowser();
    const { error } = await sb.from('booking_requests').update({ status: next }).eq('id', b.id);
    setUpdating(null);
    if (!error) {
      onRefresh({
        bookings: data.bookings.map((x) => (x.id === b.id ? { ...x, status: next } : x)),
      });
    }
  }

  if (data.bookings.length === 0) {
    return (
      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-10 text-center">
        <div className="font-serif text-3xl text-ink mb-2">No bookings yet</div>
        <p className="text-ink2 text-sm leading-relaxed max-w-md mx-auto">
          Share your profile and your QR-coded tee. Bookings come from people who already see you moving.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.bookings.map((b) => {
        const expanded = expandedId === b.id;
        return (
          <motion.div
            key={b.id}
            layout
            className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-2xl px-5 py-4 hover:shadow-[0_8px_22px_rgba(124,92,191,0.08)] transition-shadow"
          >
            <button onClick={() => setExpandedId(expanded ? null : b.id)} className="w-full text-left">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-lg text-ink leading-tight truncate">
                    {maskName(b.client_name)}
                  </div>
                  <div className="text-xs text-gray mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {b.gig_type && <span>{b.gig_type}</span>}
                    {b.event_date && <span>· {new Date(b.event_date).toLocaleDateString()}</span>}
                    {b.budget_range && <span>· {b.budget_range}</span>}
                  </div>
                </div>
                <span
                  className={`text-[0.6rem] tracking-widest uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}
                >
                  {b.status}
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-purple/10 flex flex-col gap-3">
                    {b.details && (
                      <p className="text-sm text-ink2 leading-relaxed whitespace-pre-line">{b.details}</p>
                    )}
                    <div className="text-xs text-gray">
                      Received {new Date(b.created_at).toLocaleString()}
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          disabled={updating === b.id}
                          onClick={() => setStatus(b, 'confirmed')}
                          className="bg-mint text-white px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest shadow-mint-soft active:scale-95 disabled:opacity-60"
                        >
                          Confirm
                        </button>
                        <button
                          disabled={updating === b.id}
                          onClick={() => setStatus(b, 'declined')}
                          className="bg-white border border-gray/30 text-gray px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest active:scale-95 disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
