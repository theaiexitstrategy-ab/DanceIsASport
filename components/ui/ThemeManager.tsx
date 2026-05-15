'use client';

import { useEffect } from 'react';

export default function ThemeManager() {
  useEffect(() => {
    const stored = localStorage.getItem('dia-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);

    if (!stored) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('dia-theme')) {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
  }, []);

  return null;
}

export function toggleTheme() {
  const current = document.documentElement.classList.contains('dark');
  const next = !current;
  document.documentElement.classList.toggle('dark', next);
  localStorage.setItem('dia-theme', next ? 'dark' : 'light');
}
