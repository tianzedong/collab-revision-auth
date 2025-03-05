/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        highlight: {
          '0%': { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
          '100%': { backgroundColor: 'rgba(59, 130, 246, 0)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-once': 'pulse 1.5s ease-in-out 1',
        'highlight': 'highlight 1.5s ease-out'
      }
    },
  },
  plugins: [],
}