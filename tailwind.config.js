/** @type {import('tailwindcss').Config} */

/**
 * Gwinganna palette (2026-09-21): warm paper + sage green + black.
 *
 * Three source colours, everything else derived from them:
 *   primary #697F73 — the brand sage. Every green in the app is this colour
 *                     mixed toward white (200–400) or black (600–900), so the
 *                     header gradients, ripple rings and washes stay in one
 *                     family instead of drifting into teal.
 *   beige   #FAF2EA — warm paper, used as the HIGHLIGHT, not the base. White is
 *                     the default surface; beige (and the deeper steps below it)
 *                     is what fills a row, inset or panel to lift it off that
 *                     white. Every light fill/line steps down from it; nothing
 *                     is a cool grey any more.
 *   accent  #111111 — black, and RATIONED to one hero action per screen.
 *
 * Button hierarchy note: the accent used to be acid green, which stood apart
 * from the near-black default fill on its own. Black cannot, so the default
 * filled button moved to primary-700 sage — black now reads as the hero
 * against it, and the "one loud thing per screen" rule survives the rebrand.
 *
 * Contrast note: black is invisible on the sage band, so accents sitting ON
 * the water (eyebrows, the header progress fill) use cream instead.
 *
 * Migration note: the LEGACY token names (cream, sand, green, sage, terra,
 * line, muted) are kept but REVALUED into the new system so every existing
 * class picks up the rebrand without a per-file rewrite:
 *   cream       → white (the default surface, and off-white text on dark)
 *   sand        → grey-100 warm fill
 *   green       → ink (near-black text/fills)
 *   sage        → chevron/quiet warm grey (NOT the brand sage — that's primary)
 *   terra       → ink (the no-red rule: attention is ink + accent, never alarm)
 * The old `water` and `acid` tokens are GONE, not revalued — a teal ramp and
 * an acid green have no meaning here, so they were renamed at every call site
 * (water → primary, acid → accent) to keep the names honest.
 * New code should use the new names; legacy names retire as screens are
 * touched.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ——— the brand sage: #697F73 mixed toward white, then black ———
        primary: {
          DEFAULT: '#697F73',
          // The bottom of the ramp, mixed toward paper instead of white so it stays
          // warm on white cards. Chip fills live here.
          wash: '#DCDDD3',
          200: '#C3CCC7',
          300: '#ADB9B2',
          400: '#8A9B92',
          500: '#697F73',
          // 550 exists for one reason: button labels. #697F73 is a true mid-tone,
          // so it clears 4.5:1 with NEITHER a light nor a dark label (cream 3.88,
          // white 4.30, ink 4.06). Twelve percent deeper reaches 4.78:1 with cream
          // and is near-indistinguishable. Large/decorative fills still use 500.
          550: '#5C7065',
          600: '#56685E',
          700: '#44534B',
          800: '#2F3934',
          900: '#1D2420',
        },
        // ——— the rationed hero. Pair with cream, never with ink. ———
        accent: {
          DEFAULT: '#111111',
          tint: '#EFE4D4',
        },
        ink: {
          DEFAULT: '#1A1A17',
          deep: '#0E0E0C',
        },
        // ——— surfaces: white is the default, warm beige is the highlight ———
        paper: '#FFFFFF',
        grey: {
          // The warm beige itself. Filled rows, insets and quiet panels sit here
          // to lift off the white page — the same job white cards used to do on
          // a beige page, run the other way round.
          50: '#FAF2EA',
          100: '#F0E5D7',
          150: '#EBDECE',
        },
        quiet: '#8C8377',
        disabled: '#A79C8D',
        'icon-quiet': '#5F6B62',
        chevron: '#CBBCA8',
        'line-alt': '#E2D3BF',

        // ——— legacy names, revalued (see note above) ———
        cream: '#FFFFFF',
        sand: '#F0E5D7',
        white: '#FFFFFF',
        muted: '#867C6F',
        green: {
          DEFAULT: '#1A1A17',
          deep: '#0E0E0C',
          soft: '#5F6B62',
        },
        sage: '#CBBCA8',
        terra: {
          DEFAULT: '#1A1A17',
          soft: '#867C6F',
          deep: '#1A1A17',
        },
        line: '#E8DBCA',
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
        card: '0 1px 2px rgba(26,26,23,.05)',
        nav: '0 6px 22px rgba(26,26,23,.1)',
        phone: '0 18px 50px rgba(14,14,12,.2)',
      },
    },
  },
  plugins: [],
};
