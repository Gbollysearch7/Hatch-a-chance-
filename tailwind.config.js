/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/app.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px) rotate(4deg)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' },
        },
        eggFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-2deg)' },
        },
        eggGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.3))' },
          '50%': { filter: 'drop-shadow(0 0 40px rgba(234,179,8,0.6))' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'egg-float': 'eggFloat 4s ease-in-out infinite',
        'egg-glow': 'eggGlow 2s ease-in-out infinite',
        scroll: 'scroll 30s linear infinite',
      },
      colors: {
        primary: "#4250EB",
        dark: "#0B0B0B",
        campaign: "#eab308",
        "campaign-dark": "#ca8a04",
        "campaign-light": "#fef9c3",
      },
      fontFamily: {
        'clash': ['Clash Display', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
