/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FBF7F0',
        espresso: {
          50: '#FAF6F1',
          100: '#F0E6DA',
          200: '#E0CBB3',
          300: '#CBA982',
          400: '#B5874F',
          500: '#9C6B33',
          600: '#7E5326',
          700: '#5E3E1F',
          800: '#3F2A16',
          900: '#27190D',
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
