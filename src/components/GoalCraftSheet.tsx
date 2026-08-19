import { useState } from 'react';
import { BottomSheet, SheetSlot } from './BottomSheet';
import type { PillarId } from '@/types';

/**
 * "Not everyone knows their why" (JZ, 2026-08-19). Four questions with
 * honest answers, then a few crafted goal + why options — pick one and it
 * lands in the form, still fully editable. Scripted, not a model: every
 * path through these questions was written by a person, which is why the
 * words hold up. The conversational capture can replace this later without
 * the entry point moving.
 */

export interface CraftedGoal {
  pillarId: PillarId;
  title: string;
  why: string;
}

interface Outcome {
  label: string;
  pillarId: PillarId;
  /** Ordered to match SHAPES: daily habit, hard line, visible change. */
  goals: [string, string, string];
}

const OUTCOMES: Outcome[] = [
  {
    label: 'I sleep — properly',
    pillarId: 'sleep',
    goals: ['Asleep before 10pm', 'Phone out of the bedroom', 'Seven hours, most nights'],
  },
  {
    label: 'I have energy again',
    pillarId: 'movement',
    goals: ['Move every morning', 'No day fully still', 'Hike-fit by summer'],
  },
  {
    label: "I'm calmer, less reactive",
    pillarId: 'emotional',
    goals: ['Ten quiet minutes, daily', 'No inbox before breakfast', 'End the day off my phone'],
  },
  {
    label: 'I eat like I respect myself',
    pillarId: 'nourishment',
    goals: ['Cook dinner, most nights', 'No sugar after lunch', 'Lunch is the big meal'],
  },
];

const BLOCKERS = [
  { label: 'Screens, late at night', clause: 'I want to stop losing my nights to a screen' },
  { label: 'The afternoon slump', clause: "I'm tired of the 3pm crash deciding my day" },
  { label: "A mind that won't switch off", clause: 'I want my head quiet enough to actually rest' },
  { label: 'Nothing ever sticks', clause: "I've started this before — this time I want it to hold" },
];

const WITNESSES = [
  { label: 'My partner', clause: 'my partner gets the version of me I keep promising' },
  { label: 'My kids', clause: 'my kids get the best of me, not what’s left over' },
  { label: 'The people I work with', clause: 'I stop running my days on fumes' },
  { label: 'Honestly — just me', clause: 'I can look at myself and know I kept my word' },
];

const SHAPES = [
  { label: 'One small thing, done daily', meta: 'A habit, kept' },
  { label: "A hard line I don't cross", meta: 'A boundary, held' },
  { label: 'A change people comment on', meta: 'Visible by day 30' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** The chosen draft — the caller puts it in the form, still editable. */
  onCraft: (draft: CraftedGoal) => void;
}

export function GoalCraftSheet({ open, onClose, onCraft }: Props) {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [blocker, setBlocker] = useState<(typeof BLOCKERS)[number] | null>(null);
  const [witness, setWitness] = useState<(typeof WITNESSES)[number] | null>(null);

  function reset() {
    setStep(0);
    setOutcome(null);
    setBlocker(null);
    setWitness(null);
  }

  function close() {
    reset();
    onClose();
  }

  const why =
    blocker && witness ? `${blocker.clause} — so ${witness.clause}.` : '';

  const steps = [
    {
      question: 'A few months from now, what would you most want to be different?',
      hint: 'There are no wrong answers — pick the closest.',
    },
    {
      question: 'What gets in the way, most days?',
      hint: 'The honest one, not the tidy one.',
    },
    {
      question: "Who notices when you're not okay?",
      hint: 'The why is stronger with a face on it.',
    },
    {
      question: 'What should the first 30 days look like?',
      hint: 'This shapes the goal, not the destination.',
    },
  ];

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={step < 4 ? 'Find the words' : 'Closest to true?'}
      subtitle={
        step < 4
          ? `${step + 1} of 4 · ${steps[step].hint}`
          : 'Pick one — then make it yours. Every word stays editable.'
      }
    >
      {step < 4 && (
        <p className="font-serif text-[18px] leading-snug mb-4">{steps[step].question}</p>
      )}

      {step === 0 &&
        OUTCOMES.map((o) => (
          <SheetSlot
            key={o.label}
            title={o.label}
            selected={outcome?.label === o.label}
            onClick={() => {
              setOutcome(o);
              setStep(1);
            }}
          />
        ))}

      {step === 1 &&
        BLOCKERS.map((b) => (
          <SheetSlot
            key={b.label}
            title={b.label}
            selected={blocker?.label === b.label}
            onClick={() => {
              setBlocker(b);
              setStep(2);
            }}
          />
        ))}

      {step === 2 &&
        WITNESSES.map((w) => (
          <SheetSlot
            key={w.label}
            title={w.label}
            selected={witness?.label === w.label}
            onClick={() => {
              setWitness(w);
              setStep(3);
            }}
          />
        ))}

      {step === 3 &&
        SHAPES.map((s, i) => (
          <SheetSlot
            key={s.label}
            title={s.label}
            meta={s.meta}
            onClick={() => setStep(4 + i)}
          />
        ))}

      {step >= 4 && outcome && (
        <>
          {/* The chosen shape leads, the other two stay one tap away. */}
          {[outcome.goals[step - 4], ...outcome.goals.filter((_, i) => i !== step - 4)].map(
            (g, i) => (
              <SheetSlot
                key={g}
                title={g}
                meta={i === 0 ? 'Fits the shape you chose' : undefined}
                onClick={() => {
                  onCraft({ pillarId: outcome.pillarId, title: g, why });
                  close();
                }}
              />
            ),
          )}
          <p className="text-muted text-[13px] font-serif leading-relaxed mt-3 px-1">
            Your why, drafted: &ldquo;{why}&rdquo;
          </p>
        </>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => (s >= 4 ? 3 : s - 1))}
          className="mt-3 w-full text-center text-[13px] text-muted py-2 font-semibold"
        >
          Back a question
        </button>
      )}
    </BottomSheet>
  );
}
