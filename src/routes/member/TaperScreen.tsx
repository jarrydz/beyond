import { Card, Eyebrow } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { TAPER_SUBSTANCES, type TaperSubstance } from '@/config/prepTasks';
import { daysUntil } from '@/utils/journey';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onBack: () => void;
}

/**
 * The T-7 step-down (PRD-05). Guidance, then a 7×3 grid ticked day by day.
 * Deliberately not a game: no points, and a missed day is neutral grey —
 * never red. The copy is "this makes day one easier", never "you failed".
 */
export function TaperScreen({ booking, onBack }: Props) {
  const data = useData();
  const ticks = useStoreState((s) => s.taperTicks);
  const offset = useStoreState((s) => s.demoDayOffset);

  const todayDay = daysUntil(booking.arrivalDate, offset); // days before arrival, 7..1
  const days = [7, 6, 5, 4, 3, 2, 1];

  function cellState(day: number, substance: TaperSubstance) {
    const ticked = ticks.includes(`${day}:${substance}`);
    const future = day < todayDay;
    const isToday = day === todayDay;
    return { ticked, future, isToday };
  }

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-green-soft font-semibold text-[13.5px] mt-1.5 mb-3 transition hover:text-green"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Journey
      </button>

      <h2 className="font-serif font-semibold text-[25px] leading-tight mb-1">Step down</h2>
      <p className="text-muted text-[13.5px] mb-5">
        Seven days, three things. This makes day one easier — that's all it is.
      </p>

      <Card>
        {TAPER_SUBSTANCES.map((s) => (
          <div key={s.key} className="flex items-baseline gap-2.5 mb-2 last:mb-0">
            <span className="font-semibold text-[13.5px] w-[72px] flex-none">{s.label}</span>
            <span className="text-muted text-[13px] leading-snug">{s.guidance}</span>
          </div>
        ))}
      </Card>

      <Eyebrow className="mt-5">Tick as you go</Eyebrow>
      <Card>
        <div className="grid grid-cols-[1fr_repeat(3,44px)] gap-y-1.5 items-center">
          <span />
          {TAPER_SUBSTANCES.map((s) => (
            <span
              key={s.key}
              className="text-[10.5px] tracking-[0.06em] uppercase text-muted font-semibold text-center"
            >
              {s.label.slice(0, 3)}
            </span>
          ))}
          {days.map((day) => {
            const label =
              day === todayDay ? 'Today' : day === 1 ? 'Day before' : `${day} days out`;
            const rowIsToday = day === todayDay;
            return [
              <span
                key={`label-${day}`}
                className={[
                  'text-[13px] py-1',
                  rowIsToday ? 'font-semibold text-green' : 'text-muted',
                ].join(' ')}
              >
                {label}
              </span>,
              ...TAPER_SUBSTANCES.map((s) => {
                const { ticked, future, isToday } = cellState(day, s.key);
                return (
                  <button
                    key={`${day}-${s.key}`}
                    type="button"
                    disabled={future}
                    aria-label={`${s.label}, ${label}`}
                    onClick={() => data.setTaperCell(day, s.key, !ticked)}
                    className={[
                      'w-[30px] h-[30px] mx-auto rounded-[9px] border grid place-items-center transition active:scale-90',
                      ticked
                        ? 'bg-green border-green'
                        : future
                          ? 'border-line/50 bg-transparent'
                          : 'border-line bg-sand/60', // missed/unticked = neutral, never red
                      isToday && !ticked ? 'border-green-soft' : '',
                    ].join(' ')}
                  >
                    {ticked && (
                      <svg className="w-3.5 h-3.5 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                );
              }),
            ];
          })}
        </div>
      </Card>

      <p className="text-muted text-[12.5px] px-1">
        Missed a day? Nothing to fix. Pick it up today — your body doesn't keep score the way
        apps do.
      </p>
    </section>
  );
}
