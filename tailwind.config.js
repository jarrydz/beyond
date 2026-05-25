/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F4EFE7',
        sand: '#EAE2D4',
        white: '#FCFAF6',
        ink: '#2A2A26',
        muted: '#7C766B',
        green: {
          DEFAULT: '#3A5145',
          deep: '#2C3B33',
          soft: '#6F8472',
        },
        sage: '#A7B59C',
        terra: {
          DEFAULT: '#C97B5A',
          soft: '#E7B79E',
          deep: '#B5663F',
        },
        line: '#E2D9CB',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        btn: '14px',
        sheet: '26px',
      },
      boxShadow: {
        card: '0 6px 18px rgba(42,42,38,.05)',
        phone: '0 18px 50px rgba(42,42,38,.16)',
      },
    },
  },
  plugins: [],
};
