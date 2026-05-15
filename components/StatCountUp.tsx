'use client';

import { useEffect, useRef, useState } from 'react';

export default function StatCountUp({
  target,
  isInt = false,
  suffix = '',
  duration = 1200,
  delay = 700,
}: {
  target: number;
  isInt?: boolean;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf = 0;
    const t = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(ease * target);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  const display = isInt ? Math.floor(val).toString() : val.toFixed(1);
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
