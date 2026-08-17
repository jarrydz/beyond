import { useMemo, useState } from 'react';
import { BottomSheet, Button, ButtonRow, Card, Eyebrow, Ring, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { PREP_TASK_BODY, PREP_VIDEO_META } from '@/config/prepTasks';
import { daysUntil } from '@/utils/journey';
import type { Booking, PrepTask } from '@/types';
import { ConnectBookingScreen } from './ConnectBookingScreen';
import { GoalWhyScreen } from './GoalWhyScreen';
import { TaperScreen } from './TaperScreen';

/**
 * The pre-retreat countdown (PRD-05) — Home renders this while the stage is
 * pre_retreat. Locked tasks preview what's coming (endowed progress); the
 * ring counts unlocked tasks only, so nobody sees 2/12 on day one.
 */

type SubScreen = 'connect' | 'goal' | 'taper' | null;

const SUB_SCREEN_FOR: Record<string, SubScreen> = {
  'prep-connect': 'connect',
  'prep-goal-why': 'goal',
  'prep-taper': 'taper',
};

export function JourneyScreen() {
  const data = useData();
  const booking = useStoreState((s) =>
    s.booking && s.booking.profileId === s.currentUserId ? s.booking : null,
  );
  const tasks = useStoreState((s) => s.prepTasks);
  const offset = useStoreState((s) => s.demoDayOffset);

  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [openSheetTask, setOpenSheetTask] = useState<PrepTask | null>(null);

  const daysToGo = booking ? daysUntil(booking.arrivalDate, offset) : 0;
  const connected = tasks.some((t) => t.id === 'prep-connect' && t.done);

  const unlocked = useMemo(
    () => tasks.filter((t) => daysToGo <= t.unlocksAt),
    [tasks, daysToGo],
  );
  const locked = useMemo(
    () => tasks.filter((t) => daysToGo > t.unlocksAt),
    [tasks, daysToGo],
  );
  const doneCount = unlocked.filter((t) => t.done).length;
  const hero = unlocked.find((t) => !t.done);
  const rest = unlocked.filter((t) => t !== hero);

  // "You're ready" — every required task done. Getting here (required, T-1)
  // gates this to the final day naturally; it can never flip early.
  const ready = tasks.filter((t) => t.required).every((t) => t.done);

  if (!booking) return null;

  if (subScreen === 'connect') {
    return <ConnectBookingScreen booking={booking} onBack={() => setSubScreen(null)} />;
  }
  if (subScreen === 'goal') {
    return <GoalWhyScreen onBack={() => setSubScreen(null)} />;
  }
  if (subScreen === 'taper') {
    return <TaperScreen booking={booking} onBack={() => setSubScreen(null)} />;
  }

  if (ready) return <ReadyState booking={booking} />;

  function openTask(task: PrepTask) {
    const sub = SUB_SCREEN_FOR[task.id];
    if (sub) setSubScreen(sub);
    else setOpenSheetTask(task);
  }

  return (
    <section className="px-5 pt-3 pb-7">
      <Eyebrow className="mt-1.5">Your retreat</Eyebrow>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-serif font-semibold text-[25px] leading-tight">
          {connected
            ? daysToGo === 1
              ? 'Tomorrow.'
              : `${daysToGo} days to go`
            : 'Nearly time'}
        </h2>
        <Ring value={doneCount} max={Math.max(1, unlocked.length)} size={54} />
      </div>
      <p className="text-muted text-[13.5px] mb-4">
        {connected
          ? `${formatDate(booking.arrivalDate)} · ${booking.packageName}`
          : 'Connect your booking to start the countdown.'}
      </p>

      {hero && (
        <Card tone="dark">
          <Eyebrow className="!text-sage">Next</Eyebrow>
          <h3 className="font-serif font-semibold text-[21px] leading-tight mb-1">
            {hero.title}
          </h3>
          <p className="text-[13.5px] leading-relaxed text-cream/80 mb-3.5">{hero.blurb}</p>
          <div className="flex items-center justify-between gap-3">
            <Button
              inline
              className="!bg-cream !text-green px-6"
              onClick={() => openTask(hero)}
            >
              {heroCta(hero)}
            </Button>
            {hero.required && <RequiredTag onDark />}
          </div>
        </Card>
      )}

      {rest.length > 0 && (
        <div className="space-y-2.5 mb-5">
          {rest.map((t) => (
            <TaskRow key={t.id} task={t} onClick={() => openTask(t)} />
          ))}
        </div>
      )}

      {connected && <BookingCard booking={booking} />}

      {locked.length > 0 && (
        <>
          <Eyebrow className="mt-5">Coming up</Eyebrow>
          <div className="space-y-2.5">
            {locked.map((t) => (
              <LockedRow key={t.id} task={t} daysToGo={daysToGo} />
            ))}
          </div>
        </>
      )}

      <TaskSheet
        task={openSheetTask}
        onClose={() => setOpenSheetTask(null)}
        onDone={(t) => {
          data.completePrepTask(t.id);
          setOpenSheetTask(null);
        }}
      />
    </section>
  );
}

function heroCta(task: PrepTask): string {
  switch (task.kind) {
    case 'form':
      return task.id === 'prep-connect' ? 'Connect' : 'Open the form';
    case 'reflect':
      return 'Write it down';
    case 'track':
      return 'Open the taper';
    case 'video':
      return `Watch · ${PREP_VIDEO_META[task.id]?.duration ?? ''}`.trim();
    case 'choice':
      return 'Choose';
    default:
      return 'Read';
  }
}

function TaskRow({ task, onClick }: { task: PrepTask; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[16px] border border-line bg-white px-3.5 py-3 flex items-center gap-3 transition active:scale-[0.985] hover:border-sage"
    >
      <span
        className={[
          'w-[22px] h-[22px] rounded-full grid place-items-center flex-none border',
          task.done ? 'bg-green border-green' : 'border-line',
        ].join(' ')}
      >
        {task.done && (
          <svg className="w-3 h-3 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={[
            'font-semibold text-[14px] leading-tight',
            task.done ? 'text-muted line-through decoration-line' : '',
          ].join(' ')}
        >
          {task.title}
        </div>
        {!task.done && (
          <div className="text-muted text-[12px] leading-snug mt-0.5 truncate">{task.blurb}</div>
        )}
      </div>
      {task.required && !task.done && <RequiredTag />}
    </button>
  );
}

function LockedRow({ task, daysToGo }: { task: PrepTask; daysToGo: number }) {
  const inDays = daysToGo - task.unlocksAt;
  return (
    <div className="rounded-[16px] border border-line/70 bg-white/45 px-3.5 py-3 flex items-center gap-3">
      <span className="w-[22px] h-[22px] rounded-full grid place-items-center flex-none text-muted/70">
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] leading-tight text-muted">{task.title}</div>
        <div className="text-muted/80 text-[12px] mt-0.5">
          Unlocks {inDays === 1 ? 'tomorrow' : `in ${inDays} days`}
        </div>
      </div>
    </div>
  );
}

function RequiredTag({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      className={[
        'flex-none text-[10px] tracking-[0.08em] uppercase font-semibold rounded-full px-2 py-1',
        onDark ? 'bg-cream/15 text-cream/85' : 'bg-sand text-green-soft',
      ].join(' ')}
    >
      Needed by Gwinganna
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card tone="sage">
      <Eyebrow>Your booking</Eyebrow>
      <div className="font-serif font-semibold text-[19px] leading-tight">
        {booking.packageName}
      </div>
      <div className="text-[13px] mt-1.5 space-y-0.5">
        <div>{booking.roomType}</div>
        <div>
          Arrive {formatDate(booking.arrivalDate)} · {booking.arrivalWindow}
        </div>
        <div className="text-muted">Confirmation {booking.confirmationNumber}</div>
      </div>
    </Card>
  );
}

/** The T-0 completion state. Nothing else — no upsell, no next-step CTA. Let it land. */
function ReadyState({ booking }: { booking: Booking }) {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));

  return (
    <section className="px-5 pt-3 pb-7">
      <Eyebrow className="mt-1.5">Your retreat</Eyebrow>
      <h2 className="font-serif font-semibold text-[27px] leading-tight mb-4">
        You're ready.
      </h2>

      {goal && (
        <Card tone="dark">
          <Eyebrow className="!text-sage">What you're going for</Eyebrow>
          <p className="font-serif text-[21px] leading-snug">{goal.title}</p>
          {goal.why && (
            <p className="text-[14.5px] leading-relaxed text-cream/85 mt-3 italic">
              “{goal.why}”
            </p>
          )}
        </Card>
      )}

      <Card>
        <Eyebrow>{formatDate(booking.arrivalDate)}</Eyebrow>
        <div className="font-serif font-semibold text-[19px] leading-tight">
          Arrive {booking.arrivalWindow}
        </div>
        <div className="text-[13px] text-muted mt-1">
          {booking.roomType} · {booking.packageName}
        </div>
      </Card>

      <Card tone="sage">
        <p className="text-[14.5px] leading-relaxed">
          Your host, <span className="font-semibold">{booking.hostName}</span>, has this. From
          the gate onwards there's nothing to organise, decide or check. That part is done.
        </p>
      </Card>
    </section>
  );
}

/** Read/video/external-form sheets — every task that doesn't earn a full screen. */
function TaskSheet({
  task,
  onClose,
  onDone,
}: {
  task: PrepTask | null;
  onClose: () => void;
  onDone: (t: PrepTask) => void;
}) {
  const toast = useToast();
  if (!task) return null;

  const body = PREP_TASK_BODY[task.id] ?? [task.blurb];
  const video = task.kind === 'video' ? PREP_VIDEO_META[task.id] : undefined;
  const external = (task.kind === 'form' || task.kind === 'choice') && task.id !== 'prep-connect';

  return (
    <BottomSheet open onClose={onClose} title={task.title} subtitle={task.blurb}>
      {video && (
        <div
          className="rounded-[16px] h-[150px] mb-4 grid place-items-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${video.tint}, ${video.tint}CC)` }}
        >
          <span className="w-[54px] h-[54px] rounded-full bg-white/90 grid place-items-center">
            <svg className="w-5 h-5 text-green ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5v14l12-7Z" />
            </svg>
          </span>
          <span className="absolute bottom-2.5 right-3 text-[11px] font-semibold text-white/90 bg-black/25 rounded-full px-2 py-0.5">
            {video.duration}
          </span>
        </div>
      )}
      {!video &&
        body.map((p) => (
          <p key={p.slice(0, 24)} className="text-[14px] leading-relaxed mb-3">
            {p}
          </p>
        ))}
      {external ? (
        <>
          <p className="text-muted text-[12.5px] mb-3">
            The real {task.externalLabel ?? 'form'} opens on gwinganna.com.au — nothing medical
            or personal is entered in this app.
          </p>
          <ButtonRow>
            <Button
              variant="ghost"
              onClick={() => toast('Demo — this opens on gwinganna.com.au')}
            >
              Open on gwinganna.com.au
            </Button>
            <Button onClick={() => onDone(task)}>Mark as done</Button>
          </ButtonRow>
        </>
      ) : (
        <Button onClick={() => onDone(task)}>
          {task.kind === 'video' ? 'Mark as watched' : 'Done'}
        </Button>
      )}
    </BottomSheet>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
