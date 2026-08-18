/** @type {import('tailwindcss').Config} */

/**
 * Visual refresh (design/README.md, 2026-08-18): warm greys + deep water +
 * rationed acid, Newsreader/Inter, deliberately squarer shapes.
 *
 * Migration note: the LEGACY token names (cream, sand, green, sage, terra,
 * line, muted) are kept but REVALUED into the new system so every existing
 * class picks up the refresh without a per-file rewrite:
 *   cream/white → pure white (sheets; text-on-dark)
 *   sand        → grey-100 warm fill
 *   green       → ink (the default filled button is now ink, acid is rationed)
 *   sage        → chevron/quiet grey
 *   terra       → ink (the no-red rule: attention is ink + acid, never alarm)
 * New code should use the new names; legacy names retire as screens are
 * touched.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ——— the refresh palette ———
        ink: {
          DEFAULT: '#12262B',
          deep: '#0E1A1E',
        },
        water: {
          500: '#3D6A72',
          600: '#2C5259',
          700: '#22484F',
          800: '#173238',
        },
        acid: {
          DEFAULT: '#E8FF47',
          tint: '#F3F7D8',
        },
        grey: {
          50: '#F5F5F1',
          100: '#F1F0EC',
          150: '#F0F0EA',
        },
        quiet: '#9A9A94',
        disabled: '#A6A6A0',
        'icon-quiet': '#5B615E',
        chevron: '#C4C4BE',
        'line-alt': '#E4E4DE',

        // ——— legacy names, revalued (see note above) ———
        cream: '#FFFFFF',
        sand: '#F1F0EC',
        white: '#FFFFFF',
        muted: '#8E8E88',
        green: {
          DEFAULT: '#12262B',
          deep: '#0E1A1E',
          soft: '#5B615E',
        },
        sage: '#C4C4BE',
        terra: {
          DEFAULT: '#12262B',
          soft: '#8E8E88',
          deep: '#12262B',
        },
        line: '#EAEAE4',
      },
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '6px',
        tile: '10px',
        btn: '999px',
        sheet: '22px',
        nav: '20px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,38,43,.04)',
        nav: '0 6px 22px rgba(18,38,43,.1)',
        phone: '0 18px 50px rgba(14,26,30,.2)',
      },
    },
  },
  plugins: [],
};
