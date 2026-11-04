/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saathi: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // primary rose
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        shield: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // safe emerald
          600: '#16a34a',
          700: '#15803d',
        },
        caution: {
          50: '#fffbeb',
          500: '#f59e0b', // warning amber
          600: '#d97706',
        },
        emergency: {
          50: '#fef2f2',
          500: '#ef4444', // emergency crimson
          600: '#dc2626',
          700: '#b91c1c',
        },
        slate: {
          850: '#151f32',
          950: '#0a0f1d',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

