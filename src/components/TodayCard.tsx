import { Button, Card, Eyebrow, PillarBadge } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { FOCUS_DAILY_PROMPT } from '@/config/focusQuestions';
import { FOCUS_SEQUENCE } from '@/config/focusSequence';

interface Props {
  onOpenDailyCheckIn: () => void;
}

/**
 * The daily loop in one card (PRD-06): the log is the daily action, the
 * guidance is what you get back for it. Before logging — the focus badge,
 * the day's prompt, one button. After — the insight (when it qualifies)
 * and the day's guidance. One moment, not a menu.
 *
 * Renders nothing without an active goal — the alumni path is untouched.
 */
export function TodayCard({ onOpenDailyCheckIn }: Props) {
  const data = useData();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));
  // Subscribed so the card re-renders on log or clock change; reads go through the service.
  useStoreState((s) => s.dailyCheckIns.length);
  useStoreState((s) => s.demoDayOffset);

  if (!goal) return null;

  const logged = data.getTodayCheckIn();
  const sequence = FOCUS_SEQUENCE[goal.pillarId];
  const guidance = sequence[data.getFocusDayIndex() % sequence.length];
  const insight = data.getFocusInsight(goal.pillarId);

  if (!logged) {
    return (
      <Card tone="dark">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow className="!text-sage !mb-0">One thing today</Eyebrow>
          <PillarBadge pillarId={goal.pillarId} className="!bg-cream/15 !text-cream" />
        </div>
        <p className="text-[14.5px] leading-relaxed text-cream/90 mb-3.5">
          {FOCUS_DAILY_PROMPT[goal.pillarId]}
        </p>
        <Button className="!bg-cream !text-green" onClick={onOpenDailyCheckIn}>
          Check in
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <Eyebrow className="!mb-0">Today · done ✓</Eyebrow>
        <PillarBadge pillarId={goal.pillarId} />
      </div>
      {insight && (
        <p className="font-serif text-[18px] leading-snug mb-3">{insight}</p>
      )}
      <div className="rounded-[14px] bg-sand/60 px-3.5 py-3">
        <div className="font-semibold text-[14px] mb-0.5">{guidance.title}</div>
        <p className="text-[13.5px] leading-relaxed text-muted">{guidance.body}</p>
      </div>
    </Card>
  );
}
