/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Royal Wine & Champagne Gold Luxury Ethnic Palette
        primary: '#801B34',       // Deep Royal Wine / Mulberry
        'primary-dark': '#631326',// Rich Burgundy
        secondary: '#C5A059',     // Warm Champagne Gold
        'secondary-light': '#E5C98E', // Pale Gold
        cream: '#FAF7F2',         // Warm Ivory Silk Background
        'soft-surface': '#F5EEE8',// Alabaster Silk Surface
        'soft-mint': '#F5EEE8',   // Aliased for seamless component backward-compatibility
        'text-dark': '#22181C',   // Deep Charcoal Rose
        'text-muted': '#6F6467',  // Warm Mink Grey
        'border-soft': '#E8DDD6', // Soft Warm Sand
        success: '#1B7A58',       // Regal Emerald
        'success-soft': '#EBF7F2',
        sale: '#A62A45',          // Deep Crimson
        
        // Semantic colors & backward-compatibility aliases
        accent: '#801B34',        // Deep Royal Wine
        'accent-dark': '#631326',
        'accent-light': '#F5EEE8',
        surface: '#FAF7F2',       // Warm Ivory
        'surface-50': '#FAF7F2',
        'surface-100': '#F5EEE8', // Soft Alabaster
        'surface-200': '#E8DDD6', // Soft Warm Sand
        'surface-300': '#D4C5BC',
        text: '#22181C',
        'text-800': '#22181C',
        'text-700': '#3E2E33',
        'text-500': '#6F6467',
        muted: '#6F6467',
        danger: '#A62A45',
        'danger-soft': '#FDF2F4',
        warning: '#C5A059',
        'warning-soft': '#FBF6EE',
        info: '#3B6B88',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'lg': '0.625rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        'soft': '0 4px 12px rgba(128, 27, 52, 0.06)',
        'card': '0 8px 24px rgba(34, 24, 28, 0.08)',
        '3d': '0 20px 35px -10px rgba(128, 27, 52, 0.18), 0 10px 15px -5px rgba(197, 160, 89, 0.12)',
        'gold-glow': '0 0 25px rgba(197, 160, 89, 0.35)',
      }
    },
  },
  plugins: [],
}
