/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9f2',
          100: '#dcf0df',
          200: '#bbe1c1',
          300: '#8ccb96',
          400: '#58b068',
          500: '#369447',
          600: '#287736',
          700: '#225e2d',
          800: '#1d4a27',
          900: '#183c22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
