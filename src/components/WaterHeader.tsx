import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useStoreState } from '@/store/StoreProvider';

/**
 * The header band (Gwinganna palette): every screen opens with a sage band
 * that deepens downward — deeper for member "moment" screens, shallower for
 * the coach's working tool — with faint concentric ripple rings, then a
 * sheet rises over it (see Sheet). The old floating header's points pill and
 * avatar live INSIDE the band now, so the whole thing scrolls away.
 */

interface HeaderActions {
  onPointsTap?: () => void;
  onProfileTap?: () => void;
}

/** Provided once per shell (MemberHome / CoachHome) so screens stay dumb. */
export const HeaderActionsContext = createContext<HeaderActions>({});

// Both ramps open on the brand sage (#697F73) and settle only a few steps down
// it. The floors are deliberately shallow: an earlier pass ran to near-black at
// the base, which read as a heavy scrim over the green rather than as the green
// itself. Nothing here leaves the sage family.
const GRADIENTS = {
  deep: 'linear-gradient(180deg, #697F73 0%, #5C7065 52%, #4A594F 100%)',
  shallow: 'linear-gradient(180deg, #697F73 0%, #5F7369 65%, #53635A 100%)',
};

interface Props {
  depth?: 'deep' | 'shallow';
  eyebrow?: string;
  /** Detail screens: a white back link replaces the eyebrow at the left. */
  back?: { label: string; onClick: () => void };
  /** Hide the points pill (e.g. coach side). */
  showPoints?: boolean;
  /** Hide the avatar chip (e.g. pushed detail screens). */
  showProfile?: boolean;
  children?: ReactNode;
}

export function WaterHeader({
  depth = 'deep',
  eyebrow,
  back,
  showPoints = true,
  showProfile = true,
  children,
}: Props) {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const points = useStoreState((s) => s.pointsBalance);
  const { onPointsTap, onProfileTap } = useContext(HeaderActionsContext);

  // The band sits behind the frame's status bar — flip its text to white
  // while any water header is mounted.
  useEffect(() => {
    const bar = document.getElementById('frame-status-bar');
    bar?.classList.add('text-white');
    return () => bar?.classList.remove('text-white');
  }, []);

  const rings = depth === 'deep' ? [340, 520, 700] : [420];

  return (
    <header
      className="relative overflow-hidden text-white"
      style={{ background: GRADIENTS[depth] }}
    >
      {/* ripple rings */}
      {rings.map((d, i) => (
        <div
          key={d}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: d,
            height: d,
            left: '50%',
            top: '46%',
            transform: 'translate(-50%,-50%)',
            // Cream rings, not white — and stronger than the old teal band
            // needed, since the sage ramp is lighter to begin with.
            border: `1px solid rgba(255,255,255,${0.2 - i * 0.045})`,
          }}
        />
      ))}

      <div className="relative px-6 pb-9" style={{ paddingTop: 'var(--status-pad)' }}>
        <div className="flex items-center justify-between mb-4">
          {back ? (
            <button
              type="button"
              onClick={back.onClick}
              className="flex items-center gap-1 -ml-1 text-[13px] font-semibold text-white/85 transition hover:text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              {back.label}
            </button>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {eyebrow}
            </span>
          )}
          <span className="flex items-center gap-2">
            {showPoints && (
              <button
                type="button"
                onClick={onPointsTap}
                aria-label={`${points} points — view earn history`}
                className="h-[26px] rounded-btn border border-white/45 px-2.5 text-[10.5px] font-semibold text-white/90 transition active:scale-95"
              >
                {points} pts
              </button>
            )}
            {showProfile && (
              <button
                type="button"
                onClick={onProfileTap}
                aria-label="Profile"
                className="w-[30px] h-[30px] rounded-full bg-cream text-ink grid place-items-center font-serif font-medium text-[14px] transition active:scale-90"
              >
                {me.avatarInitial}
              </button>
            )}
          </span>
        </div>
        {children}
      </div>
    </header>
  );
}

/**
 * The paper sheet that rises over the band — 22px top radius, overlapping
 * the header by 16px. Reserves ~100px at the bottom so content dissolves
 * under the docked tab bar rather than colliding with it.
 */
export function Sheet({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'relative -mt-4 rounded-t-sheet bg-paper px-6 pt-6 pb-[100px] min-h-[400px]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
