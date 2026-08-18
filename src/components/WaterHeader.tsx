import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useStoreState } from '@/store/StoreProvider';

/**
 * The deep-water header (design refresh): every screen opens with a dark
 * teal band — deeper for member "moment" screens, shallower for the coach's
 * working tool — with faint concentric ripple rings, then a white sheet
 * rises over it (see Sheet). The old floating header's points pill and
 * avatar live INSIDE the band now, so the whole thing scrolls away.
 */

interface HeaderActions {
  onPointsTap?: () => void;
  onProfileTap?: () => void;
}

/** Provided once per shell (MemberHome / CoachHome) so screens stay dumb. */
export const HeaderActionsContext = createContext<HeaderActions>({});

const GRADIENTS = {
  deep: 'linear-gradient(180deg, #3D6A72 0%, #22484F 52%, #12262B 100%)',
  shallow: 'linear-gradient(180deg, #2C5259 0%, #173238 70%, #12262B 100%)',
};

interface Props {
  depth?: 'deep' | 'shallow';
  eyebrow: string;
  /** Hide the points pill (e.g. coach side). */
  showPoints?: boolean;
  children?: ReactNode;
}

export function WaterHeader({ depth = 'deep', eyebrow, showPoints = true, children }: Props) {
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
            border: `1px solid rgba(255,255,255,${0.13 - i * 0.03})`,
          }}
        />
      ))}

      <div className="relative px-6 pb-9" style={{ paddingTop: 'var(--status-pad)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {eyebrow}
          </span>
          <span className="flex items-center gap-2">
            {showPoints && (
              <button
                type="button"
                onClick={onPointsTap}
                aria-label={`${points} points — view earn history`}
                className="h-[26px] rounded-btn border border-white/30 px-2.5 text-[10.5px] font-semibold text-white/90 transition active:scale-95"
              >
                {points} pts
              </button>
            )}
            <button
              type="button"
              onClick={onProfileTap}
              aria-label="Profile"
              className="w-[30px] h-[30px] rounded-full bg-acid text-ink grid place-items-center font-serif font-medium text-[14px] transition active:scale-90"
            >
              {me.avatarInitial}
            </button>
          </span>
        </div>
        {children}
      </div>
    </header>
  );
}

/**
 * The white sheet that rises over the water — 22px top radius, overlapping
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
        'relative -mt-4 rounded-t-sheet bg-white px-6 pt-6 pb-[100px] min-h-[400px]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
