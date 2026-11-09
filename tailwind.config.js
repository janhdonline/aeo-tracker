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
      },
      colors: {
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#ecfdf5',
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
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04), 0 10px 24px -8px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 0 0 1px rgba(15, 23, 42, 0.1), 0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 20px 40px -12px rgba(15, 23, 42, 0.06)',
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
