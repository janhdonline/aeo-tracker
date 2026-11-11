/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#ecfdf5',
        },
        neon: {
          DEFAULT: '#D4F63C',
          hover: '#C2E42E',
          glow: 'rgba(212, 246, 60, 0.4)',
        },
        obsidian: {
          DEFAULT: '#0B0F17',
          light: '#131926',
        },
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      borderRadius: {
        'bento': '24px',
        'card': '18px',
        'tile': '14px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04), 0 10px 24px -8px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 0 0 1px rgba(15, 23, 42, 0.1), 0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 20px 40px -12px rgba(15, 23, 42, 0.06)',
        'bento': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)',
        'bento-hover': '0 14px 32px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'glow-neon': '0 0 24px -4px rgba(212, 246, 60, 0.45)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.35)',
        'soft': '0 1px 2px rgba(17, 24, 39, 0.04), 0 12px 32px -16px rgba(17, 24, 39, 0.14)',
        'lift': '0 24px 60px -24px rgba(17, 24, 39, 0.25)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
