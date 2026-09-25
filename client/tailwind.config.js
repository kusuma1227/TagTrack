/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F8F7FF',
          white: '#FFFFFF',
          lavender: '#F3EEFF',
          purple: '#EEE7FF',
          pink: '#FFF0F7',
          peach: '#FFF4E8',
          green: '#ECFDF5',
          dark: '#18151F',
          secondary: '#5B5568',
          muted: '#777080',
          border: '#E9DFFF',
          inputBorder: '#DDD3F5',
        },
        brand: {
          50:  '#F8F7FF',
          100: '#F3EEFF',
          200: '#EEE7FF',
          300: '#DDD3F5',
          400: '#C4B5FD',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          violet: '#8B5CF6',
          purple: '#A855F7',
          pink: '#EC4899',
          magenta: '#F43F5E',
          orange: '#F97316',
          amber: '#F59E0B',
          green: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(139, 92, 246, 0.06)',
        'soft-md': '0 4px 20px -2px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 30px -4px rgba(139, 92, 246, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 40px -8px rgba(139, 92, 246, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow-violet': '0 4px 20px rgba(139, 92, 246, 0.25)',
        'glow-pink': '0 4px 20px rgba(236, 72, 153, 0.25)',
        'glow-orange': '0 4px 20px rgba(249, 115, 22, 0.22)',
        'glow-green': '0 4px 20px rgba(16, 185, 129, 0.22)',
        'tag-3d': '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 10px 25px -5px rgba(24, 21, 31, 0.2)',
        'card-white': '0 8px 30px rgba(139, 92, 246, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatTilt 8s ease-in-out infinite',
        'float-reverse': 'floatReverseTilt 7s ease-in-out infinite',
        'float-subtle': 'floatSubtle 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'laser-scan': 'laserScan 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatTilt: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.2deg)' },
        },
        floatReverseTilt: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-1.2deg)' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        laserScan: {
          '0%': { top: '4%', opacity: '0.9' },
          '50%': { top: '92%', opacity: '1' },
          '100%': { top: '4%', opacity: '0.9' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '50%, 100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
