import { Button, Sheet, SectionHeader, WaterHeader } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar, pillars } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { daysUntil, today } from '@/utils/journey';
import type { PillarId } from '@/types';

interface Props {
  onOpenPillar: (id: PillarId) => void;
}

/**
 * The Pillars (design refresh): the focus pillar lives in the water header —
 * acid eyebrow, serif hero, progress + day counter, one acid CTA — then the
 * sheet lists all four pillars. Only the focus row carries a bar (PRD-06
 * decision 8 holds); colour is wayfinding, not identity.
 */
export function PillarsScreen({ onOpenPillar }: Props) {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));
  const offset = useStoreState((s) => s.demoDayOffset);

  const focusId = goal?.pillarId ?? null;
  const focus = focusId ? getPillar(focusId) : null;

  // Day counter on the sim clock: days since the focus was set, inside the
  // goal window (30/100). The percentage is the same fraction.
  const totalDays = goal?.target === '100 days' ? 100 : 30;
  const setAt = goal?.focusSetAt ?? goal?.createdAt;
  const dayIndex = setAt
    ? Math.max(1, Math.min(totalDays, -daysUntil(setAt, offset) + 1))
    : 1;
  const pct = Math.round((dayIndex / totalDays) * 100);

  return (
    <>
      <WaterHeader depth="deep" eyebrow="The Pillars">
        {focus && goal ? (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-acid mb-2">
              Your focus
            </div>
            <h1 className="font-serif font-normal text-[38px] leading-[1.05] mb-2">
              {focus.label}
            </h1>
            <p className="font-serif text-[14.5px] leading-relaxed text-white/[.68] mb-4 max-w-[300px]">
              {focus.tagline}
            </p>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-[4px] rounded-[2px] bg-white/[.22] overflow-hidden">
                <div className="h-full bg-acid" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-[10px] font-semibold text-white/70">
                DAY {String(dayIndex).padStart(2, '0')} / {totalDays}
              </span>
            </div>
            <Button inline variant="acid" className="px-5 !py-2.5" onClick={() => onOpenPillar(goal.pillarId)}>
              Today's practice&ensp;→
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-serif font-normal text-[34px] leading-[1.05] mb-2">
              The Pillars
            </h1>
            <p className="font-serif text-[14.5px] leading-relaxed text-white/[.68] max-w-[300px]">
              The work you took home — pick a focus and it leads this screen.
            </p>
          </>
        )}
      </WaterHeader>

      <Sheet>
        <SectionHeader count={pillars.length}>The pillars</SectionHeader>
        <p className="font-serif text-[15px] leading-relaxed text-[#6E6E68] mb-1">
          The work you took home from Gwinganna — delivered by your coach, your group and
          the app.
        </p>

        {pillars.map((p, i) => {
          const isFocus = p.id === focusId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenPillar(p.id)}
              className={[
                'w-full flex items-center gap-3.5 py-4 text-left border-t border-line',
                i === pillars.length - 1 ? 'border-b' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'w-[34px] h-[34px] rounded-tile grid place-items-center flex-none',
                  isFocus ? 'bg-acid text-ink' : 'bg-grey-100 text-icon-quiet',
                ].join(' ')}
              >
                <span className="w-[17px] h-[17px] block [&_svg]:w-[17px] [&_svg]:h-[17px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.75]">
                  {pillarIcons[p.id]}
                </span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-serif font-medium text-[18px] leading-tight text-ink">
                    {p.label}
                  </span>
                  {isFocus && (
                    <span className="rounded-btn bg-acid-tint px-[7px] py-[3px] text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ink">
                      Focus
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-muted leading-snug mt-0.5">
                  {p.tagline}
                </span>
                {isFocus && (
                  <span className="flex items-center gap-2.5 mt-2">
                    <span className="flex-1 h-[3px] bg-line overflow-hidden rounded-full">
                      <span className="block h-full bg-ink" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="font-mono text-[9px] font-semibold text-ink">{pct}%</span>
                  </span>
                )}
              </span>
              <svg
                className={['w-[15px] h-[15px] flex-none', isFocus ? 'text-ink' : 'text-chevron'].join(' ')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          );
        })}
      </Sheet>
    </>
  );
}
