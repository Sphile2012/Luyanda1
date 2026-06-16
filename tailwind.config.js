/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2fb',
          100: '#d5e0f4',
          200: '#adc1ea',
          300: '#7d9ddc',
          400: '#5578cc',
          500: '#3B5BA5',
          600: '#2f4a8a',
          700: '#243970',
          800: '#1a2b55',
          900: '#111c3a',
        },
        navy: {
          50:  '#e8ecf5',
          100: '#c5cfe6',
          200: '#8fa5cd',
          300: '#5a7ab3',
          400: '#2f5499',
          500: '#1E3A6E',
          600: '#182e58',
          700: '#122244',
          800: '#0c1830',
          900: '#060e1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
