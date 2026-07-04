import { useNavigate } from 'react-router-dom';
import { useIsCompact } from '@/components/PhoneFrame';
import { useData } from '@/services';
import type { Role } from '@/types';

// Calm still-water ripple from the refreshed founders deck. Lives in public/, so
// resolve against BASE_URL to stay correct under the GitHub Pages base path.
const bgUrl = `${import.meta.env.BASE_URL}beyond-bg.jpg`;

// Colours sampled from the composited backdrop (photo + scrim) at the very top
// and bottom of the phone viewport. iOS Safari tints its status bar / toolbar
// from the background-color of a fixed element pinned to that edge, so these let
// the bars match the image instead of falling back to the cream body colour.
const EDGE_TOP = '#95a0a1';
const EDGE_BOTTOM = '#0b1113';

export function Welcome() {
  const navigate = useNavigate();
  const data = useData();
  const compact = useIsCompact();

  function enter(role: Role) {
    data.signIn(role);
    navigate(role === 'coach' ? '/c' : '/m', { replace: true });
  }

  return (
    <div className="absolute inset-0 z-[80] text-center text-cream">
      {/*
        Full-bleed backdrop. On a phone we pin it to the viewport (position:
        fixed) so the image and its scrim run edge-to-edge, sitting behind iOS
        Safari's status bar and toolbar. On desktop it stays absolute so it fills
        the framed device, not the window.
      */}
      <div
        className={compact ? 'fixed inset-0 -z-10' : 'absolute inset-0 -z-10'}
        style={{
          // Image full-bleed, with a soft scrim — light up top to keep the calm
          // misty feel, darker toward the base so the lead copy and button stay legible.
          backgroundColor: '#27302f',
          backgroundImage: `linear-gradient(180deg, rgba(16,26,28,0.22) 0%, rgba(16,26,28,0.05) 30%, rgba(11,19,21,0.12) 58%, rgba(9,15,17,0.62) 100%), url(${bgUrl})`,
          // Gradient fills the frame; the photo is sized to 150% so it reads ~50%
          // more zoomed-in than a plain cover crop, centred on the ripple.
          backgroundSize: '100% 100%, auto 150%',
          backgroundPosition: 'center, center',
        }}
      />

      {/*
        Bar-tint samplers (phone only). iOS Safari colours the translucent status
        bar and bottom toolbar from the background-color of a fixed element at
        that edge — a photo/gradient layer doesn't qualify, so without these the
        bars fall back to the cream page background and leave a seam. Each strip
        spans the safe-area inset (hidden under the bar) and is painted the exact
        colour of the photo at that edge, so the bars read as a continuation of
        the image with no visible band.
      */}
      {compact && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-[81]"
            style={{
              height: 'max(env(safe-area-inset-top, 0px), 12px)',
              backgroundColor: EDGE_TOP,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[81]"
            style={{
              height: 'max(env(safe-area-inset-bottom, 0px), 12px)',
              backgroundColor: EDGE_BOTTOM,
            }}
          />
        </>
      )}

      {/* Wordmark sits ~65% up from the base (centre on the 35%-from-top line). */}
      <div
        className="absolute inset-x-0 px-[30px]"
        style={{ top: '35%', transform: 'translateY(-50%)' }}
      >
        <h1
          className="text-[54px] leading-none"
          style={{
            fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            letterSpacing: '0.015em',
            textShadow: '0 1px 24px rgba(8,14,16,0.35)',
          }}
        >
          b-yond
        </h1>
      </div>

      {/* Actions sit ~14% up from the base. */}
      <div className="absolute inset-x-0 px-[30px] space-y-3" style={{ bottom: '14%' }}>
        <button
          type="button"
          onClick={() => enter('member')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-[#F1ECE2] text-green-deep hover:brightness-105"
        >
          Continue your journey
        </button>
        <button
          type="button"
          onClick={() => enter('coach')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-black text-white hover:brightness-110"
        >
          Coach access
        </button>
      </div>
    </div>
  );
}
