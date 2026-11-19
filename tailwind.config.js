/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { serif: ['Lora', 'serif'], sans: ['Inter', 'sans-serif'] },
      colors: {
        emerald: { DEFAULT: '#10b981' }, amber: { DEFAULT: '#f59e0b' },
        canvas: 'rgb(var(--canvas) / <alpha-value>)', card: 'rgb(var(--card) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)', sage: 'rgb(var(--sage) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)', warn: 'rgb(var(--warn) / <alpha-value>)',
        aitext: 'rgb(var(--aitext) / <alpha-value>)', aiverse: 'rgb(var(--aiverse) / <alpha-value>)',
        line: 'var(--border)', sunk: 'var(--sunk)', aibg: 'var(--aibg)', aiborder: 'var(--aiborder)',
      },
      boxShadow: { card: 'var(--shadow-card)' },
    },
  },
  plugins: [],
}
