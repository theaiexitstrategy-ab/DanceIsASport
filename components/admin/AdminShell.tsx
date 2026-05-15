'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { AdminData } from '@/app/admin/page';
import AdminOverviewTab from './tabs/AdminOverviewTab';
import AdminDancersTab from './tabs/AdminDancersTab';
import AdminBookingsTab from './tabs/AdminBookingsTab';
import AdminSettingsTab from './tabs/AdminSettingsTab';

type TabKey = 'overview' | 'dancers' | 'bookings' | 'settings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'dancers', label: 'Dancers' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminShell({ initial, adminEmail }: { initial: AdminData; adminEmail: string }) {
  const [tab, setTab] = useState<TabKey>('overview');
  const [data, setData] = useState(initial);

  async function signOut() {
    const sb = getSupabaseBrowser();
    await sb.auth.signOut();
    window.location.href = '/';
  }

  function refresh(patch: Partial<AdminData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="min-h-[100svh] bg-[#0f0d14] text-[#e8e4f0] flex flex-col md:flex-row">
      <aside className="md:w-60 lg:w-64 md:sticky md:top-0 md:h-[100svh] bg-[#16121f] border-b md:border-b-0 md:border-r border-white/10 flex md:flex-col p-5 md:p-7">
        <Link href="/" className="font-serif text-mint text-lg tracking-[0.04em] font-semibold">
          Dance<span className="text-white/70 font-light">IsASport</span>
        </Link>
        <span className="ml-auto md:ml-0 md:mt-1 text-[0.55rem] tracking-[0.25em] uppercase text-purple-light/70">
          Admin
        </span>
        <nav className="hidden md:flex md:flex-col gap-1 mt-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-left px-3 py-2.5 rounded-lg text-sm tracking-wide transition-all ${
                tab === t.key
                  ? 'bg-purple/30 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex flex-col gap-2 mt-auto pt-6 border-t border-white/10 text-xs text-white/60">
          <div className="truncate">{adminEmail}</div>
          <button onClick={signOut} className="text-left text-white/50 hover:text-white">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 bg-[#16121f] border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs tracking-wider uppercase transition-colors ${
              tab === t.key ? 'bg-purple/40 text-white' : 'text-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 min-w-0 px-5 md:px-10 py-7 md:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'overview' && <AdminOverviewTab data={data} />}
            {tab === 'dancers' && <AdminDancersTab data={data} onRefresh={refresh} />}
            {tab === 'bookings' && <AdminBookingsTab data={data} />}
            {tab === 'settings' && <AdminSettingsTab data={data} onRefresh={refresh} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
