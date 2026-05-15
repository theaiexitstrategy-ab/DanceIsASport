'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  alpha: number;
  color: string;
};

const COLORS = ['rgba(124,92,191,', 'rgba(91,191,160,', 'rgba(196,174,232,'];

export default function Particles({ count = 55 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function create(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4 - 0.2,
        alpha: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    resize();
    particles = Array.from({ length: count }, create);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-[0.45]" />;
}
