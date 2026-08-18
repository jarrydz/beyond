import { useState } from 'react';
import { BottomSheet, Button, Card, Eyebrow, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { darken } from '@/utils/pillars';

interface Props {
  onBack: () => void;
}

const STEPS = [
  { title: 'Choose your week', detail: 'Pick the week you want covered — that’s the whole job.' },
  { title: 'We cook it fresh', detail: 'The retreat kitchen cooks the same plant-forward menu you ate there.' },
  { title: 'It arrives chilled', detail: 'Ready to heat. No prep, no washing up worth mentioning.' },
];

/**
 * PRD-04 painted-door page — sells the offer honestly, never implies it
 * ships today. Join records intent locally and pays the one-time +5.
 */
export function MealDeliveryScreen({ onBack }: Props) {
  const data = useData();
  const toast = useToast();
  const joined = useStoreState((s) => s.mealDeliveryInterest);
  const [sheetOpen, setSheetOpen] = useState(false);
  const accent = getPillar('nourishment').accent;

  function join() {
    const award = data.registerMealDeliveryInterest();
    if (!award) return; // already on the list — inert
    setSheetOpen(true);
    toast(`+${award.points} · ${award.label}`);
  }

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-muted text-[13px] font-semibold mb-3 -ml-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Nourishment
      </button>

      <div
        className="h-[150px] rounded-card shadow-card mb-4 flex items-end p-5"
        style={{ background: `linear-gradient(135deg, ${accent}, ${darken(accent, 0.5)})` }}
      >
        <div>
          <h2 className="font-serif font-semibold text-[23px] leading-tight text-white">
            Retreat meals, delivered
          </h2>
          <p className="text-[13.5px] text-white/85 mt-0.5">
            The kitchen you loved — at your door.
          </p>
        </div>
      </div>

      <p className="text-[14px] leading-relaxed">
        The meals from your retreat, cooked and delivered to your home. Plant-forward, low-tox,
        ready to eat.
      </p>

      <Eyebrow className="mt-5 mb-2">How it works</Eyebrow>
      <Card>
        <ol className="space-y-3.5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                className="flex-none w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold text-white mt-px"
                style={{ background: accent }}
              >
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[14px]">{step.title}</div>
                <div className="text-muted text-[13px] leading-snug mt-0.5">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Eyebrow className="mt-5 mb-2">What’s in a box</Eyebrow>
      <Card>
        <p className="text-[14px] leading-relaxed">
          7 dinners · rotating seasonal menu · single or household size.
        </p>
        <p className="text-muted text-[13px] mt-2">
          From ~$129 / week — pricing indicative.
        </p>
      </Card>

      <Button
        variant={joined ? 'ghost' : 'terra'}
        className="w-full mt-1"
        disabled={joined}
        onClick={join}
      >
        {joined ? 'You’re on the list' : 'Join the list'}
      </Button>
      <p className="text-muted text-[12px] text-center mt-2.5">
        A preview, not a promise — nothing ships yet and nothing is charged.
      </p>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="You’re on the list"
        subtitle="Retreat meals, delivered"
      >
        <p className="text-[14px] leading-relaxed mb-4">
          We’ll be in touch when this opens up. (Nothing was charged — this is a preview.)
        </p>
        <Button className="w-full" onClick={() => setSheetOpen(false)}>
          Done
        </Button>
      </BottomSheet>
    </section>
  );
}
