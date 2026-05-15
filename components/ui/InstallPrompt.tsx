'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type BIP = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPrompt() {
  const [event, setEvent] = useState<BIP | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visits = Number(localStorage.getItem('dia-visits') || '0') + 1;
    localStorage.setItem('dia-visits', String(visits));
    const dismissed = localStorage.getItem('dia-a2hs-dismissed') === '1';

    const onBefore = (e: Event) => {
      e.preventDefault();
      setEvent(e as BIP);
      if (visits >= 2 && !dismissed) {
        setShow(true);
      }
    };
    window.addEventListener('beforeinstallprompt', onBefore);

    const onInstalled = () => {
      setShow(false);
      localStorage.setItem('dia-a2hs-dismissed', '1');
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    localStorage.setItem('dia-a2hs-dismissed', '1');
    setShow(false);
  }

  function dismiss() {
    localStorage.setItem('dia-a2hs-dismissed', '1');
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="fixed left-4 right-4 md:left-auto md:right-6 bottom-[max(env(safe-area-inset-bottom),1rem)] md:bottom-6 z-[450] md:max-w-sm bg-white/95 backdrop-blur-md border border-purple/20 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="font-serif text-lg text-ink leading-tight">Add to Home Screen</div>
            <div className="text-xs text-ink2 mt-0.5 leading-relaxed">
              Open Dance Is A Sport in one tap, like an app.
            </div>
          </div>
          <button
            onClick={install}
            className="bg-purple text-white text-xs font-serif tracking-widest px-4 py-2.5 rounded-xl shadow-purple-soft active:scale-95"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-gray hover:text-ink p-1.5 -mr-1"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
