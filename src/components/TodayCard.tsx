import { useState } from 'react';
import { BottomSheet, Button, Card, Eyebrow, PillarBadge, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { FOCUS_DAILY_PROMPT } from '@/config/focusQuestions';
import { FOCUS_SEQUENCE } from '@/config/focusSequence';
import { getPillar, pillars } from '@/config/pillars';
import { today } from '@/utils/journey';
import type { Goal } from '@/types';

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
  const offset = useStoreState((s) => s.demoDayOffset);
  const [changeOpen, setChangeOpen] = useState(false);

  if (!goal) return null;

  const logged = data.getTodayCheckIn();
  const sequence = FOCUS_SEQUENCE[goal.pillarId];
  const guidance = sequence[data.getFocusDayIndex() % sequence.length];
  const insight = data.getFocusInsight(goal.pillarId);

  // The 60-day stale check: focus must not go stale because a human didn't
  // turn up. One quiet line, never a nag.
  const setAt = goal.focusSetAt ?? goal.createdAt;
  const stale =
    today(offset).getTime() - new Date(setAt).getTime() > 60 * 86_400_000;

  const staleLine = stale && (
    <button
      type="button"
      onClick={() => setChangeOpen(true)}
      className="mt-3 w-full text-left text-[12.5px] text-muted"
    >
      Still working on {getPillar(goal.pillarId).label.toLowerCase()}?{' '}
      <span className="font-semibold text-green-soft underline underline-offset-2">
        Change it
      </span>
    </button>
  );

  const changeSheet = (
    <ChangeFocusSheet
      open={changeOpen}
      goal={goal}
      onClose={() => setChangeOpen(false)}
    />
  );

  if (!logged) {
    return (
      <>
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
          {staleLine && <div className="[&>button]:text-cream/70">{staleLine}</div>}
        </Card>
        {changeSheet}
      </>
    );
  }

  return (
    <>
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
        {staleLine}
      </Card>
      {changeSheet}
    </>
  );
}

/** The stale line's exit — the member re-picks; a deliberate act, not a form. */
function ChangeFocusSheet({
  open,
  goal,
  onClose,
}: {
  open: boolean;
  goal: Goal;
  onClose: () => void;
}) {
  const data = useData();
  const toast = useToast();
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Change your focus"
      subtitle="One pillar at a time — that's the point of a focus. Your goal and why stay."
    >
      {pillars.map((p) => {
        const on = p.id === goal.pillarId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              if (!on) {
                data.setFocus(goal.profileId, p.id, 'member');
                toast(`Focus is now ${p.label.toLowerCase()}`);
              }
              onClose();
            }}
            className={[
              'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[12px] mb-[9px] bg-white transition-colors',
              on ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
            ].join(' ')}
          >
            <span className="font-semibold text-[14.5px]">{p.label}</span>
            {on && (
              <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
                Current
              </span>
            )}
          </button>
        );
      })}
    </BottomSheet>
  );
}
