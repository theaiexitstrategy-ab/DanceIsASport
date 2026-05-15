'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { AdminData } from '@/app/admin/page';

export default function AdminSettingsTab({ data, onRefresh }: { data: AdminData; onRefresh: (p: Partial<AdminData>) => void }) {
  const [settings, setSettings] = useState(data.settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const sb = getSupabaseBrowser();
    await sb.from('admin_settings').update(settings).eq('id', 1);
    setSaving(false);
    setSaved(true);
    onRefresh({ settings });
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[0.6rem] tracking-[0.22em] uppercase text-purple-light/70 mb-2">Settings</div>
        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Platform <span className="italic text-mint">toggles.</span></h1>
      </div>

      <div className="bg-[#1a1625] border border-white/10 rounded-2xl divide-y divide-white/10">
        <Toggle
          on={settings.open_signups}
          onChange={(v) => setSettings({ ...settings, open_signups: v })}
          title="Open signups"
          body="New dancers can create profiles via /onboard. Turn off to pause new signups."
        />
        <Toggle
          on={settings.feed_enabled}
          onChange={(v) => setSettings({ ...settings, feed_enabled: v })}
          title="Public feed"
          body="Show the /feed video discovery page to visitors."
        />
        <Toggle
          on={settings.notify_admin_email}
          onChange={(v) => setSettings({ ...settings, notify_admin_email: v })}
          title="Email me on new bookings"
          body="Send a notification email to the admin address when a new booking_request lands."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-mint text-[#0f0d14] font-serif tracking-widest px-7 py-3 rounded-xl active:scale-95 hover:shadow-mint-soft transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-mint text-sm">Saved ✓</span>}
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  title,
  body,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  title: string;
  body: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors"
    >
      <div className="min-w-0">
        <div className="text-white font-medium">{title}</div>
        <div className="text-white/55 text-xs mt-1 leading-relaxed">{body}</div>
      </div>
      <span
        className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${
          on ? 'bg-mint' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
