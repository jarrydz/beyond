import { useNavigate } from 'react-router-dom';
import { useIsCompact } from '@/components/PhoneFrame';
import { useData } from '@/services';
import type { Role } from '@/types';

// Gwinganna hero: sunset over the infinity pool. Lives in public/, so resolve
// against BASE_URL to stay correct under the GitHub Pages base path.
const bgUrl = `${import.meta.env.BASE_URL}gwinganna-hero.jpg`;
const wordmarkUrl = `${import.meta.env.BASE_URL}gwinganna-wordmark.png`;

// Colours sampled from the composited backdrop (photo + scrim) at the very top
// and bottom of the phone viewport. iOS Safari tints its status bar / toolbar
// from the background-color of a fixed element pinned to that edge, so these let
// the bars match the image instead of falling back to the paper body colour.
const EDGE_TOP = '#544c49';
const EDGE_BOTTOM = '#1d262a';

export function Welcome() {
  const navigate = useNavigate();
  const data = useData();
  const compact = useIsCompact();

  function enter(role: Role) {
    data.signIn(role);
    // Carry the query through — a shared ?recipe= link should survive sign-in.
    navigate(
      { pathname: role === 'coach' ? '/c' : '/onboarding', search: window.location.search },
      { replace: true },
    );
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
          // Image full-bleed under a warm scrim. The sunset sky is the brightest
          // part of the frame (a white wordmark on bare sky measures ~1.5:1), so
          // the top carries real weight; the middle stays open so the sun and
          // the figure read; the base darkens hard so the buttons hold up over
          // pale pool water.
          backgroundColor: '#2a211c',
          backgroundImage: `linear-gradient(180deg, rgba(24,17,13,0.62) 0%, rgba(24,17,13,0.52) 20%, rgba(24,17,13,0.16) 40%, rgba(20,15,12,0.06) 58%, rgba(14,11,9,0.74) 100%), url(${bgUrl})`,
          backgroundSize: '100% 100%, cover',
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

      {/* The Gwinganna wordmark, centred on the 22%-from-top line. It sits high
          rather than at the old 35% mark: 35% is where the sun glow peaks, and
          white-on-glow is unreadable no matter how the scrim is tuned. The PNG
          supplied was white-on-black with no alpha — public/gwinganna-wordmark.png
          is the same art with alpha pulled from its luminance, so it composites
          over the photo instead of painting a black block. */}
      <div
        className="absolute inset-x-0 px-[34px]"
        style={{ top: '22%', transform: 'translateY(-50%)' }}
      >
        <img
          src={wordmarkUrl}
          alt="Gwinganna Lifestyle Retreat"
          className="w-full max-w-[286px] mx-auto"
          style={{ filter: 'drop-shadow(0 2px 18px rgba(10,7,5,0.55))' }}
        />
      </div>

      {/* Actions sit ~14% up from the base. */}
      <div className="absolute inset-x-0 px-[30px] space-y-3" style={{ bottom: '14%' }}>
        <button
          type="button"
          onClick={() => enter('member')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-cream text-green-deep hover:brightness-105"
        >
          Continue your journey
        </button>
        <button
          type="button"
          onClick={() => enter('coach')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-transparent text-cream border border-cream/35 hover:bg-white/10"
        >
          Coach access
        </button>
      </div>
    </div>
  );
}
