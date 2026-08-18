import { useMemo, useState } from 'react';
import { Avatar, Button, ButtonRow, Card, Eyebrow, PillarBadge, Ring, TodayCard, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { pillars } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { YOUR_WEEK, YOUR_WEEK_NOTE } from '@/config/yourWeek';
import { today } from '@/utils/journey';
import { daysSince, formatCheckInTime, greeting, relativeTime } from '@/utils/format';

interface Props {
  onGoTab: (tab: string) => void;
  onOpenDailyCheckIn: () => void;
}

export function HomeScreen({ onGoTab, onOpenDailyCheckIn }: Props) {
  const data = useData();
  const toast = useToast();

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goals = useStoreState((s) => s.goals);
  const checkIns = useStoreState((s) => s.checkIns);
  const posts = useStoreState((s) => s.posts);
  const content = useStoreState((s) => s.content);
  const affirmations = useStoreState((s) => s.affirmations);
  const coach = useStoreState(
    (s) => s.profiles.find((p) => p.role === 'coach' && p.cohortId === s.cohort.id)!,
  );

  const activeGoal = useMemo(
    () => goals.find((g) => g.profileId === me.id && g.active),
    [goals, me.id],
  );
  const nextCheckIn = useMemo(
    () =>
      checkIns
        .filter((c) => c.memberId === me.id && c.status === 'upcoming')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0],
    [checkIns, me.id],
  );
  const lastCompleted = useMemo(
    () =>
      checkIns
        .filter((c) => c.memberId === me.id && c.status === 'completed')
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0],
    [checkIns, me.id],
  );
  const latestPost = useMemo(
    () =>
      [...posts]
        .filter((p) => p.authorId !== me.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [posts, me.id],
  );
  const latestPostAuthor = useStoreState((s) =>
    latestPost ? s.profiles.find((p) => p.id === latestPost.authorId) : undefined,
  );
  const todayMovement = useMemo(() => content.find((c) => c.type === 'movement'), [content]);
  const movementDone = todayMovement?.doneBy.includes(me.id) ?? false;

  const daySinceRetreat = activeGoal ? daysSince(activeGoal.createdAt) : 0;
  const goalScore = lastCompleted?.goalScore ?? 0;

  const dailyCheckIns = useStoreState((s) => s.dailyCheckIns);
  const doneToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dailyCheckIns.some(
      (d) => d.memberId === me.id && d.recordedAt.slice(0, 10) === todayStr,
    );
  }, [dailyCheckIns, me.id]);

  const [affirmIdx, setAffirmIdx] = useState(0);
  const affirmation = affirmations[affirmIdx] ?? '';

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">
        {greeting()}, {me.fullName.split(' ')[0]}
      </h2>
      <p className="text-muted text-[13.5px] mb-4">
        Day {daySinceRetreat} since you left the retreat. Keep going.
      </p>

      {/* PRD-06: the daily loop, additive at the top — everything below is
          untouched until JZ rules on the restructure (the contested step). */}
      <TodayCard onOpenDailyCheckIn={onOpenDailyCheckIn} />
      <YourWeekCard />

      <Card>
        <Eyebrow>Daily check-in</Eyebrow>
        <p className="text-[14px] leading-relaxed mb-3">
          {doneToday
            ? 'Nice one — today\'s check-in has been sent to your coach.'
            : 'Record a quick 30-second selfie video. A snapshot of where you\'re at today.'}
        </p>
        {doneToday ? (
          <Button className="!bg-green-soft" onClick={() => toast('Already sent today.')}>
            Done today ✓
          </Button>
        ) : (
          <Button onClick={onOpenDailyCheckIn}>Do mine today</Button>
        )}
      </Card>

      <Card onClick={() => onGoTab('pillars')} className="cursor-pointer">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>Your Pillars</Eyebrow>
            <div className="font-semibold text-[15px]">The work you took home</div>
            <div className="text-muted text-[12.5px]">Where your goals and content live</div>
          </div>
          <svg className="w-4 h-4 flex-none text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
        <div className="flex gap-2 mt-3.5">
          {pillars.map((p) => (
            <div
              key={p.id}
              className="flex-1 aspect-square rounded-[13px] grid place-items-center"
              style={{ background: `${p.accent}1f`, color: p.accent }}
              title={p.label}
            >
              <span className="w-[22px] h-[22px] block [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                {pillarIcons[p.id]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {nextCheckIn && (
        <Card tone="dark">
          <Eyebrow className="!text-sage">Your next check-in</Eyebrow>
          <div className="flex items-center gap-3 mb-3.5">
            <Avatar profile={coach} style={{ background: 'rgba(255,255,255,0.16)' }} />
            <div>
              <div className="font-semibold text-[15px]">15 min with {coach.fullName.split(' ')[0]}</div>
              <div className="text-[12.5px] opacity-80">{formatCheckInTime(nextCheckIn.scheduledAt)}</div>
            </div>
          </div>
          <ButtonRow>
            <button
              type="button"
              onClick={() => toast(`Joining your call with ${coach.fullName.split(' ')[0]}…`)}
              className="font-semibold text-sm rounded-btn py-[13px] px-[18px] bg-[#F1ECE2] text-green-deep transition active:scale-[0.975]"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => onGoTab('coach')}
              className="font-semibold text-sm rounded-btn py-[13px] px-[18px] bg-transparent text-cream border border-white/40 transition active:scale-[0.975]"
            >
              Reschedule
            </button>
          </ButtonRow>
        </Card>
      )}

      {activeGoal && (
        <Card>
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <Eyebrow>This week's goal</Eyebrow>
              <div className="font-semibold text-[15px] truncate">{activeGoal.title}</div>
              <div className="text-muted text-[12.5px]">
                You set this with {coach.fullName.split(' ')[0]} on day 1
              </div>
            </div>
            <Ring value={goalScore} max={10} />
          </div>
        </Card>
      )}

      {todayMovement && (
        <>
          <Eyebrow className="mt-4 mb-2">Today</Eyebrow>
          <Card flush>
            <div
              className="h-[150px] flex items-end p-3.5 relative"
              style={{ background: 'linear-gradient(135deg,#9DB0AE,#5C7470)' }}
            >
              <span className="text-white font-semibold text-sm drop-shadow">
                {todayMovement.title}
              </span>
              <div className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-white/85 grid place-items-center pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A5145">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="p-3.5 px-4">
              <PillarBadge pillarId={todayMovement.pillarId} className="mb-2" />
              <div className="font-semibold text-[15px] mb-0.5">Move with {coach.fullName.split(' ')[0]}</div>
              {todayMovement.description && (
                <div className="text-muted text-[13px] mb-3">{todayMovement.description}</div>
              )}
              {movementDone ? (
                <Button
                  className="!bg-green-soft"
                  onClick={() => toast('Already done today.')}
                >
                  Done today ✓
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    data.markContentDone(todayMovement.id);
                    const award = data.awardPoints('content_complete', todayMovement.id);
                    toast(award ? `+${award.points} · ${award.label}` : 'Nice. Streak kept.');
                  }}
                >
                  Mark as done
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      <Card>
        <Eyebrow>Affirmation</Eyebrow>
        <p className="font-serif text-[19px] leading-snug my-0.5 mb-3">
          “{affirmation}”
        </p>
        <Button
          variant="ghost"
          onClick={() => setAffirmIdx((i) => (i + 1) % affirmations.length)}
        >
          New affirmation
        </Button>
      </Card>

      {latestPost && latestPostAuthor && (
        <>
          <Eyebrow className="mt-4 mb-2">From your group</Eyebrow>
          <Card
            onClick={() => onGoTab('group')}
            className="cursor-pointer"
          >
            <div className="flex gap-3">
              <Avatar profile={latestPostAuthor} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  {latestPostAuthor.fullName.split(' ')[0]}
                  {latestPostAuthor.fullName.split(' ')[1] ? ` ${latestPostAuthor.fullName.split(' ')[1][0]}.` : ''}
                  <span className="text-muted text-[11.5px] font-medium ml-1">
                    · {relativeTime(latestPost.createdAt)}
                  </span>
                </div>
                <div className="text-[13.5px] leading-relaxed mt-1 text-[#3a382f] line-clamp-2">
                  {latestPost.body}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}

/**
 * The outbound programme as a window, not a feature (PRD-06) — what landed
 * this week and what's coming, honest that it arrives elsewhere. No inbox,
 * no thread, no notifications; the operating model made legible.
 */
function YourWeekCard() {
  const offset = useStoreState((s) => s.demoDayOffset);
  // Monday-based position in the week, so "landed" reads naturally.
  const pos = (d: number) => (d + 6) % 7;
  const nowPos = pos(today(offset).getDay());
  return (
    <Card>
      <Eyebrow>Your week</Eyebrow>
      <div className="space-y-2">
        {YOUR_WEEK.map((t) => {
          const landed = pos(t.weekday) <= nowPos;
          return (
            <div key={t.dayLabel} className="flex items-baseline gap-3">
              <span
                className={[
                  'w-9 flex-none text-[11.5px] font-semibold tabular-nums',
                  landed ? 'text-green' : 'text-muted/70',
                ].join(' ')}
              >
                {t.dayLabel}
              </span>
              <span className={['text-[13.5px]', landed ? '' : 'text-muted'].join(' ')}>
                <span className="font-semibold">{t.channel}</span> · {t.text}
                {landed && <span className="text-green-soft"> ✓</span>}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-muted text-[12px] mt-3">{YOUR_WEEK_NOTE}</p>
    </Card>
  );
}
