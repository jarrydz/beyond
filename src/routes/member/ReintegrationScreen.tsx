import { Button, Card, Eyebrow, PillarBadge } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { REINTEGRATION_ONE_THING } from '@/config/prepTasks';
import { dayOfReintegration } from '@/utils/journey';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onOpenDailyCheckIn: () => void;
}

/**
 * Reintegration (PRD-05) — a stub by decision 3, deliberately thin. The
 * payoff is the why, restated verbatim from what was typed at T-21. The
 * daily check-in entry is where the points economy starts (decision 5).
 */
export function ReintegrationScreen({ booking, onOpenDailyCheckIn }: Props) {
  const offset = useStoreState((s) => s.demoDayOffset);
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));

  const day = dayOfReintegration(booking, offset);
  const oneThing = goal
    ? REINTEGRATION_ONE_THING[goal.pillarId]
    : REINTEGRATION_ONE_THING.emotional;

  return (
    <section className="px-5 pt-3 pb-7">
      <Eyebrow className="mt-1.5">Home again</Eyebrow>
      <h2 className="font-serif font-semibold text-[25px] leading-tight mb-4">
        Day {day} of your first 14.
      </h2>

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

      <Card>
        <div className="flex items-center justify-between mb-2">
          <Eyebrow className="!mb-0">One thing today</Eyebrow>
          {goal && <PillarBadge pillarId={goal.pillarId} />}
        </div>
        <p className="text-[14.5px] leading-relaxed">{oneThing}</p>
      </Card>

      <Card>
        <Eyebrow>Daily check-in</Eyebrow>
        <p className="text-[14px] leading-relaxed mb-3">
          Thirty seconds on where you're at. It goes to {booking.hostName} — nobody else.
        </p>
        <Button onClick={onOpenDailyCheckIn}>Do today's</Button>
      </Card>

      <p className="text-muted text-[13px] text-center mt-6">
        {booking.hostName} checks in with you on day 7.
      </p>
    </section>
  );
}
