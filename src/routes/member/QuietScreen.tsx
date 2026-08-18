import { Card, Eyebrow } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { RETREAT_DAY_SCHEDULE, RETREAT_TREATMENTS } from '@/config/prepTasks';
import { dayOfStay, stayLength, today } from '@/utils/journey';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  /** Demo escape hatch — quiet mode hides all chrome, so the stage switcher hides behind this. */
  onOpenStageSheet?: () => void;
}

/**
 * Quiet mode (PRD-05, decision 2). One screen: the day's shape and nothing
 * else. No nav, no feed, no points, no content. Gwinganna restricts devices
 * on property — an engaging app on-site fights the client and the brand.
 */
export function QuietScreen({ booking, onOpenStageSheet }: Props) {
  const offset = useStoreState((s) => s.demoDayOffset);
  const day = Math.min(dayOfStay(booking, offset), stayLength(booking));
  const date = today(offset).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-10 min-h-full">
      {onOpenStageSheet && (
        <button
          type="button"
          aria-label="Journey stage (demo)"
          onClick={onOpenStageSheet}
          className="inline-flex items-center gap-1 text-muted text-[13px] font-semibold mt-1.5 -ml-1 py-1"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back
        </button>
      )}
      <p className="text-muted text-[13px] mt-6 mb-1">{date}</p>
      <h2 className="font-serif font-semibold text-[27px] leading-tight mb-6">
        Day {day} of {stayLength(booking)}
      </h2>

      <Eyebrow>Today</Eyebrow>
      <Card>
        {RETREAT_DAY_SCHEDULE.map((row) => (
          <div key={row.time} className="flex gap-4 py-[5px] items-baseline">
            <span className="text-muted text-[12.5px] tabular-nums w-[58px] flex-none">
              {row.time}
            </span>
            <span className="text-[14.5px]">{row.item}</span>
          </div>
        ))}
      </Card>

      <Eyebrow className="mt-5">Your treatments</Eyebrow>
      <Card>
        {RETREAT_TREATMENTS.map((t) => (
          <div key={t.time} className="flex gap-4 py-[5px] items-baseline">
            <span className="text-muted text-[12.5px] tabular-nums w-[58px] flex-none">
              {t.time}
            </span>
            <span className="text-[14.5px]">
              {t.name} <span className="text-muted">· with {t.therapist}</span>
            </span>
          </div>
        ))}
      </Card>

      <p className="text-muted text-[13px] text-center mt-10">
        Everything else is waiting for you at home.
      </p>

    </section>
  );
}
