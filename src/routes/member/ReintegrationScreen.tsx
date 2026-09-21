import { Card, Eyebrow, Sheet, TodayCard, WaterHeader } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { dayOfReintegration } from '@/utils/journey';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onOpenDailyCheckIn: () => void;
  /** PRD-07 — the Today card's guidance opens a real library item. */
  onOpenContent?: (id: string) => void;
  /** Opens the day-5 check. Absent before it unlocks. */
  onOpenReflection?: () => void;
}

/**
 * Reintegration (PRD-05, deliberately thin). The payoff is the why restated
 * verbatim; when the coach set the focus at departure, her read leads
 * (PRD-06) — the expert's answer to the question the member asked
 * themselves three weeks earlier. The TodayCard is the loop: the log is
 * the one thing today, and it's where the points economy starts.
 */
export function ReintegrationScreen({
  booking,
  onOpenDailyCheckIn,
  onOpenContent,
  onOpenReflection,
}: Props) {
  const offset = useStoreState((s) => s.demoDayOffset);
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));
  const reflectionLogged = useStoreState((s) =>
    s.wellbeingChecks.some((w) => w.memberId === me.id && w.moment === 'home'),
  );

  const day = dayOfReintegration(booking, offset);

  return (
    <>
      <WaterHeader depth="deep" eyebrow="Home again">
        <h1 className="font-serif font-normal text-[30px] leading-[1.1]">
          Day {day} of your
          <br />
          first 14.
        </h1>
      </WaterHeader>
      <Sheet>

      {/* From day 5 this leads: it's the only thing on the screen that asks
          anything of them, and it closes the loop the T-21 task opened. */}
      {onOpenReflection && (
        <Card tone="sage" onClick={onOpenReflection} className="cursor-pointer">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow>{reflectionLogged ? 'Day 5 · logged' : 'Day 5'}</Eyebrow>
              <p className="font-serif font-medium text-[19px] leading-tight">
                How is it landing?
              </p>
              <p className="text-muted text-[13px] leading-snug mt-1">
                {reflectionLogged
                  ? 'Your words, and where you put yourself.'
                  : 'Your words from before you came, and where you are now.'}
              </p>
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
          </div>
        </Card>
      )}

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

      <TodayCard onOpenDailyCheckIn={onOpenDailyCheckIn} onOpenContent={onOpenContent} />

      <p className="text-muted text-[13px] text-center mt-6">
        {booking.hostName} checks in with you on day 7.
      </p>
      </Sheet>
    </>
  );
}
