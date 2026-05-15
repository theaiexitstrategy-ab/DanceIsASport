'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { DashboardData } from '@/app/dashboard/page';
import ProfileTab from './tabs/ProfileTab';
import BookingsTab from './tabs/BookingsTab';
import MerchTab from './tabs/MerchTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

type TabKey = 'profile' | 'bookings' | 'merch' | 'analytics' | 'settings';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    key: 'bookings',
    label: 'Bookings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    key: 'merch',
    label: 'Merch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M4 6 L9 3 C10 4.5 14 4.5 15 3 L20 6 L22 9 L19 10 L19 21 L5 21 L5 10 L2 9 Z" />
      </svg>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M3 21h18M6 17v-6M11 17v-9M16 17v-4M21 17v-7" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

export default function DashboardShell({ initial }: { initial: DashboardData }) {
  const [tab, setTab] = useState<TabKey>('profile');
  const [data, setData] = useState(initial);

  async function signOut() {
    const sb = getSupabaseBrowser();
    await sb.auth.signOut();
    window.location.href = '/';
  }

  function refresh(patch: Partial<DashboardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="min-h-[100svh] bg-bg flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col bg-white/85 backdrop-blur-md border-r border-purple/15 md:sticky md:top-0 md:h-[100svh] p-7">
        <Link href="/" className="font-serif text-purple text-xl tracking-[0.04em] font-semibold">
          Dance<span className="text-ink font-light">IsASport</span>
        </Link>
        <div className="mt-10 flex flex-col gap-1">
          {TABS.map((t) => (
            <SidebarBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} icon={t.icon}>
              {t.label}
            </SidebarBtn>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-purple/10">
          <Link
            href={`/${data.dancer.handle}`}
            target="_blank"
            className="text-xs text-purple hover:underline"
          >
            View public profile →
          </Link>
          <button onClick={signOut} className="text-xs text-gray hover:text-ink text-left">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur-md border-b border-purple/10 px-5 md:px-10 py-4 flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl md:text-3xl text-ink leading-tight">
              Hey {data.dancer.display_name.split(' ')[0]} <span aria-hidden>👋</span>
            </div>
            <div className="text-xs text-gray mt-0.5">@{data.dancer.handle}</div>
          </div>
          <button
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full border border-purple/15 bg-white flex items-center justify-center text-purple hover:bg-purple-pale transition-colors active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
            {data.bookings.some((b) => b.status === 'pending') && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-mint" />
            )}
          </button>
        </header>

        <div className="px-5 md:px-10 py-6 md:py-10 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === 'profile' && <ProfileTab data={data} onRefresh={refresh} />}
              {tab === 'bookings' && <BookingsTab data={data} onRefresh={refresh} />}
              {tab === 'merch' && <MerchTab data={data} />}
              {tab === 'analytics' && <AnalyticsTab data={data} />}
              {tab === 'settings' && <SettingsTab data={data} onRefresh={refresh} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-purple/15 flex justify-around py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 transition-colors active:scale-90 ${tab === t.key ? 'text-purple' : 'text-gray'}`}
          >
            {t.icon}
            <span className="text-[0.6rem] tracking-widest uppercase">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function SidebarBtn({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all ${
        active
          ? 'bg-purple text-white shadow-purple-soft'
          : 'text-ink2 hover:bg-purple-pale hover:text-purple'
      }`}
    >
      <span className="opacity-90">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
