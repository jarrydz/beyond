import { useMemo, useState } from 'react';
import { Avatar, Button, ButtonRow, Card, Eyebrow, useToast } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { daysSince, shortDate } from '@/utils/format';
import type { ContentItem } from '@/types';

export function GrowScreen() {
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const content = useStoreState((s) => s.content);
  const checkIns = useStoreState((s) => s.checkIns);
  const goals = useStoreState((s) => s.goals);
  const posts = useStoreState((s) => s.posts);
  const coach = useStoreState(
    (s) => s.profiles.find((p) => p.role === 'coach' && p.cohortId === s.cohort.id)!,
  );

  const recipe = useMemo(() => content.find((c) => c.type === 'recipe'), [content]);
  const movement = useMemo(() => content.find((c) => c.type === 'movement'), [content]);
  const event = useMemo(() => content.find((c) => c.type === 'event'), [content]);

  const completed = useMemo(
    () =>
      checkIns
        .filter((c) => c.memberId === me.id && c.status === 'completed' && typeof c.goalScore === 'number')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [checkIns, me.id],
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
      {/* Weekly content (from Learn) */}
      <Eyebrow className="mb-2">This week</Eyebrow>

      {recipe && <RecipeCard item={recipe} />}

      {movement && (
        <Card flush>
          <div
            className="h-[150px] flex items-end p-3.5 relative"
            style={{ background: 'linear-gradient(135deg,#9DB0AE,#5C7470)' }}
          >
            <span className="text-white font-semibold text-sm drop-shadow">{movement.title}</span>
            <div className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-white/85 grid place-items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A5145">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="p-3.5 px-4">
            <div className="font-semibold text-[15px]">3 movement sessions</div>
            <div className="text-muted text-[13px]">
              Filmed by {coach.fullName.split(' ')[0]}. Do them anywhere, any level.
            </div>
          </div>
        </Card>
      )}

      {event && (
        <Card>
          <Eyebrow>Live this week</Eyebrow>
          <div className="flex items-center gap-3">
            <Avatar
              profile={{
                id: 'chef',
                fullName: 'Chef',
                avatarInitial: 'C',
                role: 'coach',
                cohortId: '',
                onboarded: true,
              }}
              style={{ background: '#8C7B9C' }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14.5px]">{event.title}</div>
              <div className="text-muted text-[12.5px]">{event.description}</div>
            </div>
            <button
              type="button"
              onClick={() => toast("You're registered for Wednesday")}
              className="font-semibold text-[13px] rounded-btn px-3.5 py-2 bg-terra text-white transition active:scale-[0.975]"
            >
              RSVP
            </button>
          </div>
        </Card>
      )}

      {/* Progress (from Progress) */}
      <Eyebrow className="mt-5 mb-2">Your progress</Eyebrow>

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
    </section>
  );
}

function RecipeCard({ item }: { item: ContentItem }) {
  const toast = useToast();
  const [showList, setShowList] = useState(false);
  const shoppingList: string[] = item.payload?.shoppingList ?? [];

  return (
    <Card flush>
      <div
        className="h-[150px] flex items-end p-3.5"
        style={{ background: 'linear-gradient(135deg,#E7B79E,#C97B5A)' }}
      >
        <span className="text-white font-semibold text-sm drop-shadow">Nourish bowl · 20 min</span>
      </div>
      <div className="p-3.5 px-4">
        <div className="font-semibold text-[15px]">{item.title}</div>
        {item.description && (
          <div className="text-muted text-[13px] mt-0.5 mb-3">{item.description}</div>
        )}
        <ButtonRow>
          <Button variant="ghost" onClick={() => toast('Recipe cards opening…')}>
            View recipes
          </Button>
          <Button variant="ghost" onClick={() => setShowList((v) => !v)}>
            {showList ? 'Hide list' : 'Shopping list'}
          </Button>
        </ButtonRow>
        {showList && shoppingList.length > 0 && (
          <ul className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
            {shoppingList.map((it) => (
              <li key={it} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-sage" />
                {it}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
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
