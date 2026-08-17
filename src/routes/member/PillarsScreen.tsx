import { useStoreState } from '@/store/StoreProvider';
import { pillars } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { pillarMomentum } from '@/utils/pillars';
import type { PillarId } from '@/types';

interface Props {
  onOpenPillar: (id: PillarId) => void;
}

/** The hero of the demo: every pillar in app order, each tappable. */
export function PillarsScreen({ onOpenPillar }: Props) {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const content = useStoreState((s) => s.content);
  const goals = useStoreState((s) => s.goals);
  const checkIns = useStoreState((s) => s.checkIns);

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">The Pillars</h2>
      <p className="text-muted text-[13.5px] mb-4">
        The work you took home from Gwinganna — delivered by your coach, your group and
        the app.
      </p>

      <div className="space-y-3">
        {pillars.map((p) => {
          const m = pillarMomentum(p.id, { content, goals, checkIns, meId: me.id });
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenPillar(p.id)}
              className="w-full text-left rounded-card border border-line bg-white shadow-card p-3.5 flex items-center gap-3.5 transition active:scale-[0.985] hover:border-sage"
            >
              <div
                className="w-12 h-12 rounded-[16px] grid place-items-center flex-none"
                style={{ background: `${p.accent}1f`, color: p.accent }}
              >
                <span className="w-6 h-6 block [&_svg]:w-6 [&_svg]:h-6 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                  {pillarIcons[p.id]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-serif font-semibold text-[17px] leading-tight truncate">
                    {p.label}
                  </div>
                  {m.hasGoal && (
                    <span
                      className="flex-none text-[9.5px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
                      style={{ background: `${p.accent}1f`, color: p.accent }}
                    >
                      Your focus
                    </span>
                  )}
                </div>
                <div className="text-muted text-[12.5px] leading-snug mt-0.5">{p.tagline}</div>
                <div className="mt-2 h-[5px] rounded-full bg-sand overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${m.value * 10}%`, background: p.accent }}
                  />
                </div>
              </div>

              <svg
                className="w-4 h-4 flex-none text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          );
        })}
      </div>
    </section>
  );
}
