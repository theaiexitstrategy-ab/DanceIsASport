'use client';

import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW register failed', e));
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
