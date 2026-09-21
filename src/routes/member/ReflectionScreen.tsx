import { useMemo, useState } from 'react';
import { Button, Card, Eyebrow, Sheet, WaterHeader, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { WELLBEING_SCALES, stopLabel, type WellbeingScale } from '@/config/wellbeing';
import { getPillar } from '@/config/pillars';
import { shortDate } from '@/utils/format';
import { dayOfReintegration } from '@/utils/journey';
import type { Booking, WellbeingDimension } from '@/types';

interface Props {
  booking: Booking;
  onBack: () => void;
}

/**
 * The day-5 check (PRD-05). Gwinganna's real post-stay survey is an email that
 * arrives after checkout and asks you to score the accommodation and the
 * facilities out of five. This is the deliberate opposite of that, and the
 * order of the screen is the argument:
 *
 *   1. their own words from before they arrived, at full size
 *   2. five scales about THEM, in words rather than numbers
 *   3. the pre-arrival baseline on the same track, so the movement is theirs
 *   4. one open line
 *
 * A survey can only measure the stay because the stay is all it has. This
 * screen opens with something written nineteen days before check-in, which is
 * why it can measure a person instead. Nothing here scores the retreat — there
 * is no question the retreat can do well on.
 */
export function ReflectionScreen({ booking, onBack }: Props) {
  const data = useData();
  const toast = useToast();
  const offset = useStoreState((s) => s.demoDayOffset);
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const goal = useStoreState((s) => s.goals.find((g) => g.profileId === me.id && g.active));
  // Select the array, derive in the component: a selector that filters returns a
  // fresh array every call, and useSyncExternalStore reads that as a new
  // snapshot forever.
  const allChecks = useStoreState((s) => s.wellbeingChecks);
  const checks = useMemo(() => allChecks.filter((w) => w.memberId === me.id), [allChecks, me.id]);

  const baseline = checks.find((c) => c.moment === 'baseline');
  const logged = checks.find((c) => c.moment === 'home');
  const host = booking.hostName;

  const [scores, setScores] = useState<Partial<Record<WellbeingDimension, number>>>(
    () => logged?.scores ?? {},
  );
  const [note, setNote] = useState('');

  const answered = WELLBEING_SCALES.every((s) => scores[s.id] !== undefined);
  // Descriptive only, the FOCUS_INSIGHT rule (PRD-06 decision 6): this counts
  // what moved and stops. It does not say the retreat moved it.
  const moved = WELLBEING_SCALES.filter(
    (s) => baseline && scores[s.id] !== undefined && scores[s.id] !== baseline.scores[s.id],
  ).length;

  function save() {
    const missing = WELLBEING_SCALES.find((s) => scores[s.id] === undefined);
    if (missing) {
      toast(`${missing.label} is still blank`);
      return;
    }
    data.addWellbeingCheck({
      scores: scores as Record<WellbeingDimension, number>,
      note,
    });
    toast('Thank you.');
  }

  return (
    <>
      <WaterHeader depth="deep" back={{ label: 'Home', onClick: onBack }} showProfile={false}>
        <h1 className="font-serif font-normal text-[30px] leading-[1.1]">
          Day {dayOfReintegration(booking, offset)} home.
          <br />
          How is it landing?
        </h1>
      </WaterHeader>
      <Sheet>
        {/* The words lead, at the top of the sheet and in the highlight colour —
            this is the one thing on the screen a survey structurally cannot do,
            so it gets the size and the position to match. */}
        <div className="-mx-6 -mt-6 mb-8 px-6 pt-7 pb-6 bg-grey-50 rounded-t-sheet">
          <Eyebrow className="!text-quiet">Your words, before you came</Eyebrow>
          {goal?.why ? (
            <blockquote className="font-serif text-[21px] leading-[1.42] text-ink">
              &ldquo;{goal.why}&rdquo;
            </blockquote>
          ) : (
            <p className="font-serif text-[21px] leading-[1.42] text-ink">
              {goal?.title ?? 'Your goal is still to come.'}
            </p>
          )}
          {goal && (
            <p className="text-[12px] text-quiet mt-4 leading-relaxed">
              Written {shortDate(goal.createdAt)} · {getPillar(goal.pillarId).label} ·{' '}
              {goal.title}
            </p>
          )}
        </div>

        <Eyebrow>Where you are now</Eyebrow>
        <p className="text-[13.5px] text-muted leading-relaxed mb-6">
          Five taps — not a score out of ten, just where you&rsquo;d put yourself today. The
          ring on each row is where you were before you arrived.
        </p>

        <div className="space-y-5 mb-6">
          {WELLBEING_SCALES.map((scale) => (
            <ScaleRow
              key={scale.id}
              scale={scale}
              value={scores[scale.id]}
              baseline={baseline?.scores[scale.id]}
              readOnly={!!logged}
              onPick={(i) => setScores((s) => ({ ...s, [scale.id]: i }))}
            />
          ))}
        </div>

        {answered && baseline && (
          <p className="text-[13px] text-ink/75 leading-relaxed mb-8 px-0.5">
            {moved === 0
              ? 'Nothing has moved yet. Five days is early — this is the marker, not the verdict.'
              : `${moved === 5 ? 'All five' : `${moved} of five`} have moved since before you came.`}
          </p>
        )}

        {logged ? (
          <>
            {logged.note && (
              <Card tone="sage">
                <Eyebrow>What you said</Eyebrow>
                <p className="font-serif text-[17px] leading-snug italic">
                  &ldquo;{logged.note}&rdquo;
                </p>
              </Card>
            )}
            <p className="text-muted text-[12.5px] text-center leading-relaxed">
              Logged {shortDate(logged.takenAt)}. {host} reads this before your day 7 call.
            </p>
          </>
        ) : (
          <>
            <Eyebrow>In a sentence</Eyebrow>
            <p className="text-[13.5px] text-muted leading-relaxed mb-3">
              What&rsquo;s different that you weren&rsquo;t expecting? One line is plenty.
            </p>
            <textarea
              className="w-full bg-white border border-line rounded-[14px] px-4 py-3 text-[14px] leading-relaxed resize-none outline-none focus:border-sage placeholder:text-muted/70 mb-4"
              rows={3}
              placeholder={"I've been waking before my alarm. I keep waiting for it to stop."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={save}>Send to {host}</Button>
            <p className="text-muted text-[12px] text-center mt-3 leading-relaxed">
              Goes to {host}, not to a survey. She reads it before your day 7 call.
            </p>
          </>
        )}
      </Sheet>
    </>
  );
}

/**
 * One dimension: a five-stop track that fills left to right, with a ring on the
 * stop they sat at before arrival. The comparison lives INSIDE the control they
 * are answering — there's no second chart to read, and no way to set today's
 * answer without seeing where you started.
 */
function ScaleRow({
  scale,
  value,
  baseline,
  readOnly,
  onPick,
}: {
  scale: WellbeingScale;
  value?: number;
  baseline?: number;
  readOnly: boolean;
  onPick: (index: number) => void;
}) {
  const before = baseline === undefined ? null : stopLabel(scale.id, baseline);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="font-semibold text-[14.5px]">{scale.label}</span>
        <span className="text-[12.5px] text-right">
          {value === undefined ? (
            before && <span className="text-quiet">{before} before</span>
          ) : (
            <>
              {before && <span className="text-quiet">{before} </span>}
              <span className="text-chevron">&rarr;</span>{' '}
              <span className="font-semibold text-ink">{stopLabel(scale.id, value)}</span>
            </>
          )}
        </span>
      </div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={scale.label}>
        {scale.stops.map((stop, i) => (
          <button
            key={stop}
            type="button"
            role="radio"
            aria-checked={i === value}
            aria-label={stop}
            disabled={readOnly}
            onClick={() => onPick(i)}
            className="flex-1 h-9 grid place-items-center relative disabled:cursor-default"
          >
            {i === baseline && (
              <span
                aria-hidden
                className="absolute w-[21px] h-[21px] rounded-full border-[1.5px] border-primary-400"
              />
            )}
            <span
              className={[
                'w-[11px] h-[11px] rounded-full transition-colors',
                value !== undefined && i <= value ? 'bg-primary-550' : 'bg-grey-150',
              ].join(' ')}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
