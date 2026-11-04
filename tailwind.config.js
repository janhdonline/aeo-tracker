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
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#10b981',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(17, 24, 39, 0.04), 0 12px 32px -16px rgba(17, 24, 39, 0.14)',
        'lift': '0 24px 60px -24px rgba(17, 24, 39, 0.25)',
      },
    },
  },
  plugins: [],
};
