import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#faf9fc',
        bg2: '#f3f1f8',
        bg3: '#ede9f5',
        purple: {
          DEFAULT: '#7c5cbf',
          mid: '#9b7fd4',
          light: '#c4aee8',
          pale: '#ede9f5',
        },
        mint: {
          DEFAULT: '#5bbfa0',
          light: '#a8dfd0',
          pale: '#e4f5f0',
        },
        gray: {
          DEFAULT: '#7a7585',
          light: '#b5b0c0',
          pale: '#eceaf2',
        },
        ink: '#2a2535',
        ink2: '#5a5468',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-jost)', 'Jost', 'sans-serif'],
      },
      boxShadow: {
        'purple-soft': '0 4px 14px rgba(124,92,191,0.3)',
        'purple-lift': '0 12px 28px rgba(124,92,191,0.45)',
        'mint-soft': '0 4px 12px rgba(91,191,160,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
