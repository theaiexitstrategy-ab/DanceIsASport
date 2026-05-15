'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { uploadToCloudinary } from '@/lib/cloudinary';
import type { DashboardData } from '@/app/dashboard/page';

const NIL_STATUS = [
  'High School Uncommitted',
  'High School Committed',
  'College Athlete',
  'Professional',
  'Other',
];

export default function SettingsTab({ data, onRefresh }: { data: DashboardData; onRefresh: (p: Partial<DashboardData>) => void }) {
  const [form, setForm] = useState({
    display_name: data.dancer.display_name,
    location: data.dancer.location || '',
    bio: data.dancer.bio || '',
    avatar_url: data.dancer.avatar_url || '',
    years_experience: data.dancer.years_experience ?? 5,
    instagram: data.dancer.instagram || '',
    tiktok: data.dancer.tiktok || '',
    of_handle: data.dancer.of_handle || '',
    nil_state: data.dancer.nil_state || '',
    nil_status: data.dancer.nil_status || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { secure_url } = await uploadToCloudinary(file);
      setForm({ ...form, avatar_url: secure_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const sb = getSupabaseBrowser();
    const { error: e } = await sb
      .from('dancers')
      .update({
        display_name: form.display_name,
        location: form.location || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        years_experience: form.years_experience,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        of_handle: form.of_handle || null,
        nil_state: form.nil_state || null,
        nil_status: form.nil_status || null,
      })
      .eq('id', data.dancer.id);
    setSaving(false);
    if (e) {
      setError(e.message);
    } else {
      setSaved(true);
      onRefresh({
        dancer: {
          ...data.dancer,
          ...form,
          location: form.location || null,
          bio: form.bio || null,
          avatar_url: form.avatar_url || null,
          instagram: form.instagram || null,
          tiktok: form.tiktok || null,
          of_handle: form.of_handle || null,
          nil_state: form.nil_state || null,
          nil_status: form.nil_status || null,
        },
      });
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function deleteAccount() {
    const sb = getSupabaseBrowser();
    await sb.from('dancers').update({ is_published: false }).eq('id', data.dancer.id);
    await sb.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Profile photo">
        <div className="flex items-center gap-5">
          <div className="w-24 h-32 rounded-xl overflow-hidden border border-purple/15 bg-purple-pale flex items-center justify-center">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : uploading ? (
              <span className="text-purple-light text-xs">Uploading…</span>
            ) : (
              <span className="text-purple-light text-xs">No photo</span>
            )}
          </div>
          <label className="cursor-pointer text-sm text-purple border border-purple/30 px-4 py-2.5 rounded-xl hover:bg-purple-pale active:scale-95 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            Upload new
          </label>
        </div>
      </Card>

      <Card title="Identity">
        <Field label="Display name">
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className={`${inputCls} min-h-[120px] resize-y`}
          />
        </Field>
        <Field label={`Years: ${form.years_experience === 20 ? '20+' : form.years_experience}`}>
          <input
            type="range"
            min={1}
            max={20}
            value={form.years_experience}
            onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })}
            className="w-full accent-purple"
          />
        </Field>
      </Card>

      <Card title="Social">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Instagram">
            <input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className={inputCls}
              placeholder="@handle"
            />
          </Field>
          <Field label="TikTok">
            <input
              value={form.tiktok}
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              className={inputCls}
              placeholder="@handle"
            />
          </Field>
          <Field label="OF (private)">
            <input
              value={form.of_handle}
              onChange={(e) => setForm({ ...form, of_handle: e.target.value })}
              className={inputCls}
              placeholder="@handle"
            />
          </Field>
        </div>
      </Card>

      <Card title="NIL">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="State">
            <input
              value={form.nil_state}
              onChange={(e) => setForm({ ...form, nil_state: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.nil_status}
              onChange={(e) => setForm({ ...form, nil_status: e.target.value })}
              className={inputCls}
            >
              <option value="">—</option>
              {NIL_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-3 sticky bottom-20 md:static z-10">
        <button
          onClick={save}
          disabled={saving}
          className="bg-gradient-to-br from-purple to-purple-mid text-white font-serif tracking-widest px-7 py-3 rounded-xl shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-mint text-sm">Saved ✓</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>

      <Card title="Danger zone" tone="danger">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          Unpublishes your profile. Your data stays so you can come back. To fully delete, contact support.
        </p>
        {confirmDelete ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={deleteAccount}
              className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest active:scale-95"
            >
              Yes, unpublish me
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="bg-white border border-gray/30 text-gray px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest active:scale-95"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="bg-white border border-red-300 text-red-500 px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest active:scale-95"
          >
            Unpublish profile
          </button>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'danger' }) {
  return (
    <div
      className={`bg-white/85 backdrop-blur-md border rounded-3xl p-6 md:p-7 flex flex-col gap-4 ${
        tone === 'danger' ? 'border-red-200/60' : 'border-purple/15'
      }`}
    >
      <div className={`text-[0.62rem] tracking-[0.2em] uppercase ${tone === 'danger' ? 'text-red-500' : 'text-purple-mid'}`}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] focus:-translate-y-px transition-all';
