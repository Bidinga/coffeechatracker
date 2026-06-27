/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Near-white page background with a faint cool tint so white cards lift.
        mist: '#F4F8FB',
        // BNY deep institutional blue (from the wordmark).
        navy: {
          50: '#ECF2F7',
          100: '#D2E2EC',
          200: '#A7C4D7',
          300: '#6F9CB7',
          400: '#3F6E8E',
          500: '#1E4F70',
          600: '#143C57',
          700: '#0E2C41',
          800: '#0A2236',
          900: '#06151F',
        },
        // BNY forward-arrow teal (the single accent).
        teal: {
          50: '#E8F6FA',
          100: '#C6EAF2',
          200: '#93D9E6',
          300: '#56C3D7',
          400: '#27A9C4',
          500: '#1B90A9',
          600: '#16768B',
          700: '#125F70',
        },
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
