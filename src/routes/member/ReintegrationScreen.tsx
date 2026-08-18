import { Card, Eyebrow, TodayCard } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { dayOfReintegration } from '@/utils/journey';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onOpenDailyCheckIn: () => void;
}

/**
 * Reintegration (PRD-05, deliberately thin). The payoff is the why restated
 * verbatim; when the coach set the focus at departure, her read leads
 * (PRD-06) — the expert's answer to the question the member asked
 * themselves three weeks earlier. The TodayCard is the loop: the log is
 * the one thing today, and it's where the points economy starts.
 */
export function ReintegrationScreen({ booking, onOpenDailyCheckIn }: Props) {
  const offset = useStoreState((s) => s.demoDayOffset);
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));

  const day = dayOfReintegration(booking, offset);

  return (
    <section className="px-5 pt-3 pb-7">
      <Eyebrow className="mt-1.5">Home again</Eyebrow>
      <h2 className="font-serif font-semibold text-[25px] leading-tight mb-4">
        Day {day} of your first 14.
      </h2>

      {goal?.focusSetBy === 'coach' && goal.focusNote && (
        <Card tone="sage">
          <Eyebrow>{booking.hostName}'s read</Eyebrow>
          <p className="font-serif font-semibold text-[20px] leading-tight">
            {getPillar(goal.pillarId).label}.
          </p>
          <p className="text-[14.5px] leading-relaxed italic mt-2">“{goal.focusNote}”</p>
        </Card>
      )}

      {goal && (
        <Card tone="dark">
          <Eyebrow className="!text-sage">Why you went</Eyebrow>
          <p className="font-serif text-[20px] leading-snug">{goal.title}</p>
          {goal.why && (
            <p className="text-[14.5px] leading-relaxed text-cream/85 mt-3 italic">
              “{goal.why}”
            </p>
          )}
        </Card>
      )}

      <TodayCard onOpenDailyCheckIn={onOpenDailyCheckIn} />

      <p className="text-muted text-[13px] text-center mt-6">
        {booking.hostName} checks in with you on day 7.
      </p>
    </section>
  );
}
