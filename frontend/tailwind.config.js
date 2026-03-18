/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        'primary-light': 'hsl(var(--color-primary) / 0.8 / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-dark': 'hsl(var(--color-accent) / 0.9 / <alpha-value>)',
        'accent-light': 'hsl(var(--color-accent) / 0.2 / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-100': 'hsl(var(--color-surface) / 0.95 / <alpha-value>)',
        'surface-200': 'hsl(var(--color-surface) / 0.9 / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
        'text-800': 'hsl(var(--color-text) / 0.8 / <alpha-value>)',
        'text-700': 'hsl(var(--color-text) / 0.7 / <alpha-value>)',
        'text-500': 'hsl(var(--color-text) / 0.5 / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        'muted/10': 'hsl(var(--color-muted) / 0.1 / <alpha-value>)',
        'muted/20': 'hsl(var(--color-muted) / 0.2 / <alpha-value>)',
        'muted/30': 'hsl(var(--color-muted) / 0.3 / <alpha-value>)',
        'muted/50': 'hsl(var(--color-muted) / 0.5 / <alpha-value>)',
        'muted/70': 'hsl(var(--color-muted) / 0.7 / <alpha-value>)',

        // New semantic colors
        success: 'hsl(142, 70%, 40% / <alpha-value>)',
        'success-soft': 'hsl(142, 70%, 90% / <alpha-value>)',
        'success-light': 'hsl(142, 70%, 80% / <alpha-value>)',
        danger: 'hsl(350, 70%, 50% / <alpha-value>)',
        'danger-soft': 'hsl(350, 70%, 90% / <alpha-value>)',
        'danger-light': 'hsl(350, 70%, 80% / <alpha-value>)',
        warning: 'hsl(40, 90%, 50% / <alpha-value>)',
        'warning-soft': 'hsl(40, 90%, 90% / <alpha-value>)',
        'warning-light': 'hsl(40, 90%, 80% / <alpha-value>)',

        // New colors for badges and other elements
        info: 'hsl(200, 70%, 50% / <alpha-value>)',
        'info-soft': 'hsl(200, 70%, 90% / <alpha-value>)',
        purple: 'hsl(225, 73%, 57% / <alpha-value>)',
        'purple-soft': 'hsl(225, 73%, 90% / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'soft': '0 4px 10px rgba(0,0,0,0.05)',
        'card': '0 8px 20px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}
