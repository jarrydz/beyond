import { Button, Card, Eyebrow, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import type { ContentItem } from '@/types';

interface Session {
  key: string;
  label: string;
}

interface Props {
  item: ContentItem;
  onDone: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * The weekly movement planner (PRD-07) — the PRD-05 taper-grid pattern
 * reused: days × session types, tap to commit, persisted so the plan is
 * still there tomorrow. Empty cells are neutral; nothing is ever red.
 */
export function WeekPlanner({ item, onDone }: Props) {
  const data = useData();
  const toast = useToast();
  const ticks = useStoreState((s) => s.plannerTicks);
  const sessions = (item.config?.sessions as Session[]) ?? [];
  const done = useStoreState((s) =>
    s.library.some((c) => c.id === item.id && c.doneBy.includes(s.currentUserId)),
  );

  return (
    <>
      <Card>
        <div
          className="grid gap-y-1.5 items-center"
          style={{ gridTemplateColumns: `1fr repeat(${sessions.length}, 64px)` }}
        >
          <span />
          {sessions.map((s) => (
            <span
              key={s.key}
              className="text-[10.5px] tracking-[0.06em] uppercase text-muted font-semibold text-center"
            >
              {s.label}
            </span>
          ))}
          {DAYS.map((day, dayIdx) => [
            <span key={`d-${day}`} className="text-[13px] text-muted py-1">
              {day}
            </span>,
            ...sessions.map((s) => {
              const on = ticks.includes(`${dayIdx}:${s.key}`);
              return (
                <button
                  key={`${day}-${s.key}`}
                  type="button"
                  aria-label={`${s.label}, ${day}`}
                  onClick={() => data.setPlannerCell(dayIdx, s.key, !on)}
                  className={[
                    'w-[30px] h-[30px] mx-auto rounded-[9px] border grid place-items-center transition active:scale-90',
                    on ? 'bg-green border-green' : 'border-line bg-sand/40',
                  ].join(' ')}
                >
                  {on && (
                    <svg className="w-3.5 h-3.5 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
              );
            }),
          ])}
        </div>
      </Card>

      <p className="text-muted text-[12.5px] px-1 mb-4">
        Commit to what you'll actually do, not the week you'd like to have. Three sessions kept
        beats seven intended.
      </p>

      <Button
        disabled={ticks.length === 0}
        onClick={() => {
          if (!done) onDone();
          else toast('Plan updated.');
        }}
      >
        {done ? 'Update the plan' : 'Keep this plan'}
      </Button>
    </>
  );
}
