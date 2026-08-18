import { useEffect, useState } from 'react';
import { Button, Card, Eyebrow } from '.';
import type { ContentItem } from '@/types';

interface Step {
  title: string;
  detail: string;
  seconds?: number;
}

interface Props {
  item: ContentItem;
  /** Token substitution — '{lightsOut}' etc. Personalisation stays in code; data stays pure. */
  vars?: Record<string, string>;
  onDone: () => void;
}

/**
 * One engine, four datasets (PRD-07): the circadian template, the
 * acupressure workshop, the qi gong sequence and the cook-along are all
 * ordered steps from config. Timers are quiet and skippable — they never
 * block progress. Reaching the end completes the item.
 */
export function StepSequence({ item, vars = {}, onDone }: Props) {
  const steps = ((item.config?.steps as Step[]) ?? []).map((s) => ({
    ...s,
    title: substitute(s.title, vars),
    detail: substitute(s.detail, vars),
  }));
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const step = steps[idx];
  const last = idx === steps.length - 1;

  // A quiet countdown where the step carries one. Skippable, never blocking.
  useEffect(() => {
    if (!step?.seconds || finished) {
      setRemaining(null);
      return;
    }
    setRemaining(step.seconds);
    const t = setInterval(
      () => setRemaining((r) => (r !== null && r > 0 ? r - 1 : r)),
      1000,
    );
    return () => clearInterval(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) return null;

  if (finished) {
    return (
      <Card tone="sage">
        <Eyebrow>Done</Eyebrow>
        <p className="font-serif font-semibold text-[19px] leading-snug">
          That's the whole sequence.
        </p>
        <p className="text-[13.5px] text-muted mt-1.5">
          It's here whenever you want to run it again.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <Eyebrow className="!mb-0">
          {idx + 1} of {steps.length}
        </Eyebrow>
        {remaining !== null && (
          <span
            className={[
              'text-[12.5px] font-semibold tabular-nums',
              remaining === 0 ? 'text-green' : 'text-muted',
            ].join(' ')}
          >
            {remaining === 0 ? 'Time' : formatSeconds(remaining)}
          </span>
        )}
      </div>

      <Card>
        <h3 className="font-serif font-semibold text-[21px] leading-tight mb-2">
          {step.title}
        </h3>
        <p className="text-[14.5px] leading-relaxed">{step.detail}</p>
      </Card>

      <div className="flex gap-2.5">
        <Button
          variant="ghost"
          className="flex-1"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (last) {
              setFinished(true);
              onDone();
            } else {
              setIdx((i) => i + 1);
            }
          }}
        >
          {last ? 'Finish' : 'Next'}
        </Button>
      </div>
    </>
  );
}

function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}
