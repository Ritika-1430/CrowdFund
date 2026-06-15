/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F5',
        cream: '#F5F0EB',
        sand: '#E8DDD3',
        charcoal: '#1A1A1A',
        stone: '#6B6560',
        coral: '#E86B4A',
        terracotta: '#C25538',
        sage: '#7B9E7B',
        'sage-dark': '#5F8260',
        navy: '#1E2D3D',
        'navy-light': '#2A3F54',
        gold: '#D4A853',
        'warm-white': '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(26,26,26,0.04), 0 1px 2px rgba(26,26,26,0.06)',
        'warm': '0 4px 16px rgba(26,26,26,0.06), 0 1px 3px rgba(26,26,26,0.04)',
        'warm-md': '0 8px 30px rgba(26,26,26,0.08), 0 2px 6px rgba(26,26,26,0.04)',
        'warm-lg': '0 16px 50px rgba(26,26,26,0.10), 0 4px 12px rgba(26,26,26,0.05)',
        'warm-xl': '0 24px 60px rgba(26,26,26,0.12), 0 8px 20px rgba(26,26,26,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'marquee': 'marquee 40s linear infinite',
        'underline-in': 'underlineIn 0.3s ease-out forwards',
        'count-up': 'countUp 1.5s ease-out',
        'subtle-float': 'subtleFloat 6s ease-in-out infinite',
        'grain': 'grain 0.5s steps(1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        underlineIn: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '30%': { transform: 'translate(3%, -15%)' },
          '50%': { transform: 'translate(12%, 9%)' },
          '70%': { transform: 'translate(9%, 4%)' },
          '90%': { transform: 'translate(-1%, 7%)' },
        },
      },
    },
  },
  plugins: [],
}