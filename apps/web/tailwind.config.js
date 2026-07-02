/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F2EEE9',
        ink: '#F8F5F0',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F4F0EB',
          overlay: '#EDE7E0',
        },
        gold: {
          50: '#FFF9E8',
          200: '#FFE39A',
          300: '#FFCC69',
          500: '#FFB82E',
          600: '#E69713',
          800: '#815318',
          DEFAULT: '#FFB82E',
        },
        teal: {
          300: '#B8A7F8',
          500: '#927CDF',
          700: '#6652AD',
          DEFAULT: '#927CDF',
        },
        content: {
          primary: '#1F1E1C',
          secondary: '#4F4A45',
          muted: '#817A72',
          disabled: '#AAA39A',
        },
        success: '#7E9F35',
        warning: '#FFB82E',
        danger: '#B95F50',
        info: '#927CDF',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        display: ['Kaiti SC', 'STKaiti', 'Songti SC', 'STSong', 'serif'],
        mono: ['Avenir Next', 'SF Pro Rounded', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: ['0.5rem', { lineHeight: '0.75rem', letterSpacing: '.05em' }],
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '.02em' }],
      },
      borderColor: {
        subtle: 'rgba(52,44,37,.10)',
        'gold-glow': 'rgba(255,184,46,.38)',
        'teal-glow': 'rgba(146,124,223,.30)',
      },
      borderRadius: {
        cyber: '0.875rem',
        panel: '1.375rem',
        sheet: '1.75rem',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(74,58,43,.08), inset 0 1px rgba(255,255,255,.72)',
        'glow-gold': '0 8px 24px rgba(255,184,46,.18)',
        'glow-teal': '0 8px 24px rgba(146,124,223,.14)',
        'glow-danger': '0 8px 24px rgba(185,95,80,.12)',
      },
      backgroundImage: {
        'cyber-grid': 'radial-gradient(circle, rgba(130,92,70,.12) 1px, transparent 1.5px)',
        'gold-sheen': 'linear-gradient(135deg, #FFD777 0%, #FFB82E 70%, #F19D21 100%)',
        'panel-radial': 'radial-gradient(circle at 90% 0%, rgba(255,184,46,.18), transparent 45%)',
      },
      backgroundSize: {
        'cyber-grid': '16px 16px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      transitionTimingFunction: {
        cyber: 'cubic-bezier(.2,.8,.2,1)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '.45', transform: 'scale(.96)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'screen-in': {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.8s ease-in-out infinite',
        scan: 'scan 4s linear infinite',
        'screen-in': 'screen-in .3s ease both',
        'slow-spin': 'slow-spin 12s linear infinite',
      },
      screens: {
        phone: '390px',
        webview: '480px',
      },
    },
  },
  plugins: [],
}
