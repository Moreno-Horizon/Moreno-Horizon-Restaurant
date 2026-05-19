/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
          brand: {
              orange: '#FFA726',
              orangeHover: '#F57C00',
              blue: '#2196F3',
              blueHover: '#1976D2',
              dark: '#1e293b'
          },
          luxury: {
              gold: '#D4AF37',
              goldLight: '#F3E5AB',
              goldDark: '#996515',
              rose: '#B76E79',
              emerald: '#50C878',
              sapphire: '#0F52BA',
              ruby: '#E0115F',
              platinum: '#E5E4E2',
              onyx: '#353839',
              amber: '#FFBF00'
          }
      },
      boxShadow: {
          'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)',
          'glow-rose': '0 0 20px rgba(183, 110, 121, 0.4), inset 0 0 10px rgba(183, 110, 121, 0.1)',
          'glow-emerald': '0 0 20px rgba(80, 200, 120, 0.4), inset 0 0 10px rgba(80, 200, 120, 0.1)',
          'glow-sapphire': '0 0 20px rgba(15, 82, 186, 0.4), inset 0 0 10px rgba(15, 82, 186, 0.1)',
          'glow-amber': '0 0 20px rgba(255, 191, 0, 0.4), inset 0 0 10px rgba(255, 191, 0, 0.1)',
          'glow-white': '0 0 20px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)',
      },
      dropShadow: {
          'glow-gold': '0 0 10px rgba(212, 175, 55, 0.6)',
          'glow-white': '0 0 10px rgba(255, 255, 255, 0.6)',
      },
      fontFamily: {
          sans: ['Cairo', 'sans-serif'],
          serif: ['Amiri', 'serif'],
      },
      animation: {
          'slide-down': 'slideDown 0.3s ease-out',
          'slide-in': 'slideIn 0.3s ease-out',
          'fade-in': 'fadeIn 0.3s ease-out',
          'glow-pulse': 'glowPulse 3s ease-in-out infinite'
      },
      keyframes: {
          slideDown: {
              '0%': { transform: 'translateY(-10%)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideIn: {
              '0%': { transform: 'translateX(100%)', opacity: '0' },
              '100%': { transform: 'translateX(0)', opacity: '1' },
          },
          fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
          glowPulse: {
              '0%, 100%': { filter: 'brightness(1)' },
              '50%': { filter: 'brightness(1.2)' }
          }
      }
    },
  },
  plugins: [],
}
