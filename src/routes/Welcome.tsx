import { useNavigate } from 'react-router-dom';

// Calm still-water ripple from the refreshed founders deck. Lives in public/, so
// resolve against BASE_URL to stay correct under the GitHub Pages base path.
const bgUrl = `${import.meta.env.BASE_URL}beyond-bg.jpg`;

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="absolute inset-0 z-[80] text-center text-cream"
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
    >
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

      {/* Action sits ~14% up from the base. */}
      <div className="absolute inset-x-0 px-[30px]" style={{ bottom: '14%' }}>
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-[#F1ECE2] text-green-deep hover:brightness-105"
        >
          Continue your journey
        </button>
      </div>
    </div>
  );
}
