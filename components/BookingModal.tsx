'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase';

type Props = {
  open: boolean;
  onClose: () => void;
  dancerId: string;
  dancerName: string;
};

const GIG_TYPES = [
  'Music Video',
  'Live Event / Party',
  'Brand / Promo Campaign',
  'College Showcase',
  'Other',
];
const BUDGETS = ['Under $200', '$200 – $500', '$500 – $1,000', '$1,000+'];

export default function BookingModal({ open, onClose, dancerId, dancerName }: Props) {
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_name || !form.client_email) return;
    setSubmitting(true);
    setError(null);
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
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSuccess(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 bg-ink/55 backdrop-blur-md z-[200] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/[0.97] border border-purple/15 rounded-[20px] w-full max-w-[520px] p-8 md:p-10 max-h-[90vh] overflow-y-auto relative"
            style={{ boxShadow: '0 40px 80px rgba(124,92,191,0.2)' }}
          >
            <div
              className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(124,92,191,0.08) 0%, transparent 70%)' }}
            />

            {success ? (
              <div className="text-center py-8 relative z-10">
                <div className="font-serif text-2xl text-ink mb-2">Request sent ✓</div>
                <div className="text-ink2 text-sm leading-relaxed mb-6">
                  We&apos;ve forwarded your booking request to {dancerName}. They&apos;ll reach out via the platform.
                </div>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-br from-purple to-purple-mid text-white px-6 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:-translate-y-0.5 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="relative z-10">
                <div className="font-serif text-[1.7rem] font-semibold text-ink leading-tight mb-1">
                  Book {dancerName}
                </div>
                <div className="text-[0.75rem] text-gray leading-relaxed mb-8">
                  Your contact info stays private. We handle all communication securely through the platform.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <Field label="Your Name">
                    <input
                      required
                      type="text"
                      placeholder="Full name"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      className="form-field"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      value={form.client_email}
                      onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                      className="form-field"
                    />
                  </Field>
                </div>

                <Field label="Gig Type" className="mb-5">
                  <select
                    value={form.gig_type}
                    onChange={(e) => setForm({ ...form, gig_type: e.target.value })}
                    className="form-field"
                  >
                    <option value="">Select a service...</option>
                    {GIG_TYPES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <Field label="Event Date">
                    <input
                      type="date"
                      value={form.event_date}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                      className="form-field"
                    />
                  </Field>
                  <Field label="Budget Range">
                    <select
                      value={form.budget_range}
                      onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                      className="form-field"
                    >
                      <option value="">Select...</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Details" className="mb-6">
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    placeholder="Describe the gig — location, duration, what you need..."
                    className="form-field resize-y min-h-[90px]"
                  />
                </Field>

                <div className="bg-gradient-to-br from-purple-pale to-mint-pale border border-purple/15 rounded-xl px-4 py-3 text-[0.71rem] text-ink2 leading-relaxed mb-6">
                  <strong className="text-purple">Privacy Notice:</strong> {dancerName}&apos;s personal information — real
                  name, address, and banking details — is never shared with clients. All payments are processed securely
                  through the platform. By submitting you agree to our{' '}
                  <strong className="text-purple">Booking Terms &amp; Usage Rights Agreement</strong>.
                </div>

                {error && <div className="text-red-500 text-xs mb-3">{error}</div>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-transparent text-gray border border-gray-pale px-5 py-3.5 rounded-xl text-[0.78rem] hover:border-gray hover:text-ink hover:bg-bg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-br from-purple to-purple-mid text-white px-4 py-3.5 rounded-xl font-serif text-base font-semibold tracking-[0.08em] shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-purple-mid hover:to-mint transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Sending…' : 'Send Booking Request'}
                  </button>
                </div>
              </form>
            )}

            <style jsx>{`
              .form-field {
                width: 100%;
                background: var(--bg);
                border: 1px solid var(--gray-pale);
                color: var(--text);
                padding: 0.75rem 0.9rem;
                font-family: var(--font-jost), 'Jost', sans-serif;
                font-size: 0.85rem;
                font-weight: 300;
                outline: none;
                border-radius: 10px;
                transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                appearance: none;
              }
              .form-field:focus {
                border-color: var(--purple-light);
                background: var(--white);
                box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.1);
                transform: translateY(-1px);
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray mb-2 group-focus-within:text-purple">
        {label}
      </label>
      {children}
    </div>
  );
}
