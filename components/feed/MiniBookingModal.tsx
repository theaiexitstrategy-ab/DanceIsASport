'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase';

const GIG_TYPES = ['Music Video', 'Live Event / Party', 'Brand / Promo Campaign', 'College Showcase', 'Other'];
const BUDGETS = ['Under $200', '$200 – $500', '$500 – $1,000', '$1,000+'];

export default function MiniBookingModal({
  open,
  onClose,
  dancerId,
  dancerName,
}: {
  open: boolean;
  onClose: () => void;
  dancerId: string;
  dancerName: string;
}) {
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    gig_type: '',
    event_date: '',
    budget_range: '',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
    }
  }, [open, dancerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_name || !form.client_email || !dancerId) return;
    setSubmitting(true);
    setError(null);
    try {
      const sb = browserSupabase();
      const { error: insertError } = await sb.from('booking_requests').insert({
        dancer_id: dancerId,
        client_name: form.client_name,
        client_email: form.client_email,
        gig_type: form.gig_type || null,
        event_date: form.event_date || null,
        budget_range: form.budget_range || null,
        details: form.details || null,
      });
      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setForm({
          client_name: '',
          client_email: '',
          gig_type: '',
          event_date: '',
          budget_range: '',
          details: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 bg-ink/65 backdrop-blur-md z-[300] flex items-end md:items-center justify-center"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="bg-white w-full md:max-w-[480px] md:rounded-3xl rounded-t-3xl px-6 md:px-8 py-7 md:py-9 max-h-[88vh] overflow-y-auto shadow-2xl"
          >
            <div className="md:hidden w-12 h-1.5 bg-purple-pale rounded-full mx-auto mb-5" />
            {success ? (
              <div className="text-center py-6">
                <div className="font-serif text-2xl md:text-3xl text-ink mb-2">Sent ✓</div>
                <div className="text-ink2 text-sm leading-relaxed mb-6">
                  Your request is with {dancerName}. They&apos;ll reach out through the platform.
                </div>
                <button
                  onClick={onClose}
                  className="bg-purple text-white font-serif tracking-widest px-7 py-3 rounded-xl shadow-purple-soft active:scale-95 transition-transform"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="font-serif text-2xl md:text-3xl text-ink mb-1">Book {dancerName}</div>
                <div className="text-xs text-gray mb-6 leading-relaxed">
                  Your contact info stays private. We handle communication.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Your name"
                    value={form.client_name}
                    onChange={(v) => setForm({ ...form, client_name: v })}
                    required
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={form.client_email}
                    onChange={(v) => setForm({ ...form, client_email: v })}
                    required
                  />
                </div>
                <Select
                  value={form.gig_type}
                  onChange={(v) => setForm({ ...form, gig_type: v })}
                  options={GIG_TYPES}
                  placeholder="Gig type"
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    type="date"
                    placeholder=""
                    value={form.event_date}
                    onChange={(v) => setForm({ ...form, event_date: v })}
                  />
                  <Select
                    value={form.budget_range}
                    onChange={(v) => setForm({ ...form, budget_range: v })}
                    options={BUDGETS}
                    placeholder="Budget"
                  />
                </div>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Tell them about the gig…"
                  className="w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] transition-all resize-y min-h-[80px] mb-4"
                />

                {error && (
                  <div className="text-red-500 text-xs mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest py-3.5 rounded-xl shadow-purple-soft active:scale-[0.98] hover:shadow-purple-lift transition-all disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send Booking Request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-gray text-sm mt-3 py-2"
                >
                  Cancel
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] focus:-translate-y-px transition-all"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] transition-all ${className ?? ''}`}
    >
      <option value="">{placeholder}…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
