import { useMemo } from 'react';
import { Card, Eyebrow } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { daysSince, shortDate } from '@/utils/format';
import type { Subscription } from '@/types';

export function ProgressScreen() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const checkIns = useStoreState((s) => s.checkIns);
  const goals = useStoreState((s) => s.goals);
  const posts = useStoreState((s) => s.posts);
  const content = useStoreState((s) => s.content);

  const completed = useMemo(
    () =>
      checkIns
        .filter((c) => c.memberId === me.id && c.status === 'completed' && typeof c.goalScore === 'number')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [checkIns, me.id],
  );

  const subscription = useStoreState((s) =>
    s.subscriptions.find((sub) => sub.profileId === s.currentUserId),
  );

  const activeGoal = goals.find((g) => g.profileId === me.id && g.active);
  const streak = activeGoal ? daysSince(activeGoal.createdAt) : 0;
  const myPosts = posts.filter((p) => p.authorId === me.id).length;
  const contentDone = content.filter((c) => c.doneBy.includes(me.id)).length;

  const trendLine = useMemo(() => {
    if (completed.length < 2) return null;
    const first = completed[0].goalScore!;
    const last = completed[completed.length - 1].goalScore!;
    if (last > first) return 'Trending up. Keep stacking quiet wins.';
    if (last < first) return 'Wobbling a little — name the blocker and shrink the goal.';
    return 'Holding steady. Steady is its own kind of progress.';
  }, [completed]);

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">Your progress</h2>
      <p className="text-muted text-[13.5px] mb-4">
        The proof you're becoming who you said you'd be
      </p>

      <Card>
        <Eyebrow>Goal score · check-ins so far</Eyebrow>
        {completed.length === 0 ? (
          <p className="text-muted text-[13.5px] pt-2">
            No completed check-ins yet — book one with your coach.
          </p>
        ) : (
          <>
            <BarChart
              bars={completed.map((c, i) => ({
                value: c.goalScore ?? 0,
                label: shortDate(c.scheduledAt),
                hi: i >= completed.length - 2,
              }))}
            />
            {trendLine && (
              <div className="text-muted text-[12.5px] text-center mt-5">{trendLine}</div>
            )}
          </>
        )}
      </Card>

      <Card>
        <Stat num={streak} label="day streak with your active goal" />
        <Stat num={myPosts} label="posts shared with your group" />
        <Stat num={contentDone} label="pieces of content marked done" />
        <Stat num={completed.length} label="check-ins kept with your coach" last />
      </Card>

      <Card tone="terra">
        <p className="font-serif text-[18px] leading-snug">
          You haven't waited for the next retreat to change. You're changing now.
        </p>
      </Card>

      <Eyebrow className="mt-5 mb-2">Settings</Eyebrow>
      <Card>
        <SubscriptionRow subscription={subscription} />
      </Card>
    </section>
  );
}

function BarChart({ bars }: { bars: { value: number; label: string; hi?: boolean }[] }) {
  return (
    <div className="flex items-end gap-2 h-[84px] my-1.5 mb-7 relative">
      {bars.map((b, i) => {
        const height = Math.max(6, Math.round((b.value / 10) * 100));
        return (
          <div
            key={i}
            className={[
              'flex-1 rounded-t-[7px] rounded-b-[4px] relative',
              b.hi ? 'bg-green' : 'bg-sage',
            ].join(' ')}
            style={{ height: `${height}%` }}
            aria-label={`${b.label}: ${b.value}/10`}
          >
            <span className="absolute -bottom-5 inset-x-0 text-center text-[10px] text-muted font-semibold">
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ num, label, last }: { num: number; label: string; last?: boolean }) {
  return (
    <div
      className={[
        'flex items-center gap-3.5 py-3.5',
        last ? '' : 'border-b border-line',
      ].join(' ')}
    >
      <div className="font-serif text-[26px] font-semibold text-green min-w-[54px]">{num}</div>
      <div className="text-muted text-[13px]">{label}</div>
    </div>
  );
}

function SubscriptionRow({ subscription }: { subscription?: Subscription }) {
  const planLabel = subscription ? 'Beyond · Monthly' : 'No active plan';
  const statusLabel = subscription
    ? subscription.status === 'mock' ? 'Active' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    : '—';
  const since = subscription?.startedAt
    ? new Date(subscription.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold text-[14.5px]">Subscription</div>
        <div className="text-muted text-[12.5px] mt-0.5">
          {planLabel}{since ? ` · since ${since}` : ''}
        </div>
      </div>
      <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
        {statusLabel}
      </span>
    </div>
  );
}
