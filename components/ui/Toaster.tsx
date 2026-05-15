'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: string; type: ToastType; message: string };

const ToastCtx = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <Toaster>');
  return ctx.push;
}

export default function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
    return () => clearTimeout(t);
  }, [toasts]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 md:bottom-auto md:top-6 md:right-6 md:left-auto z-[500] flex flex-col items-center md:items-end gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-md text-sm font-medium max-w-[92vw] md:max-w-md flex items-center gap-3 ${
                t.type === 'success'
                  ? 'bg-mint/95 text-white border-mint/40'
                  : t.type === 'error'
                  ? 'bg-red-500/95 text-white border-red-400/40'
                  : 'bg-purple/95 text-white border-purple/40'
              }`}
            >
              <ToastIcon type={t.type} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') return <span aria-hidden>✓</span>;
  if (type === 'error') return <span aria-hidden>!</span>;
  return <span aria-hidden>★</span>;
}
