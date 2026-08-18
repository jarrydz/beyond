import { useState } from 'react';
import { BookmarkIcon, BottomSheet, Button, Card, Eyebrow, PillarBadge, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { darken } from '@/utils/pillars';

interface Props {
  mealId: string;
  onBack: () => void;
}

/**
 * One recipe, kitchen-readable: hero, meta, ingredients, numbered method.
 * Lives inside the pillars tab (state-pushed from the Nourishment library),
 * same pattern as PillarDetailScreen.
 */
export function MealDetailScreen({ mealId, onBack }: Props) {
  const data = useData();
  const toast = useToast();
  const meal = useStoreState((s) => s.meals.find((m) => m.id === mealId));
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  if (!meal) return null;

  const pillar = getPillar(meal.pillarId);

  function toggleSave() {
    if (!meal) return;
    data.toggleSaveMeal(meal.id);
    if (meal.saved) {
      toast('Removed from your saved recipes.');
      return;
    }
    const award = data.awardPoints('save_recipe', meal.id);
    toast(award ? `+${award.points} · ${award.label}` : 'Saved to your recipes.');
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
        {pillar.label}
      </button>

      <div
        className="h-[150px] rounded-card shadow-card mb-4 relative"
        style={{
          background: `linear-gradient(135deg, ${meal.tint}, ${darken(meal.tint, 0.45)})`,
        }}
      >
        <button
          type="button"
          aria-label={meal.saved ? 'Remove from saved' : 'Save recipe'}
          aria-pressed={meal.saved}
          onClick={toggleSave}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/85 grid place-items-center shadow-card transition active:scale-90"
        >
          <BookmarkIcon filled={meal.saved} />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif font-semibold text-[23px] leading-tight">{meal.title}</h2>
      </div>
      <div className="mt-2">
        <PillarBadge pillarId={meal.pillarId} />
      </div>
      <p className="text-muted text-[13.5px] leading-relaxed mt-2.5">{meal.intro}</p>

      <Card className="mt-4">
        <div className="grid grid-cols-3 text-center">
          <MetaStat label="Prep" value={`${meal.prepMins} min`} />
          <MetaStat label="Cook" value={meal.cookMins > 0 ? `${meal.cookMins} min` : '—'} divided />
          <MetaStat label="Serves" value={`${meal.servings}`} divided />
        </div>
      </Card>

      <Eyebrow className="mt-5 mb-2">Ingredients</Eyebrow>
      <Card>
        <ul className="space-y-2">
          {meal.ingredients.map((ing) => (
            <li key={ing} className="flex gap-2.5 text-[14px] leading-snug">
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full flex-none"
                style={{ background: pillar.accent }}
              />
              {ing}
            </li>
          ))}
        </ul>
      </Card>

      <Eyebrow className="mt-5 mb-2">Method</Eyebrow>
      <Card>
        <ol className="space-y-3.5">
          {meal.steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-[14px] leading-relaxed">
              <span
                className="flex-none w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold text-white mt-px"
                style={{ background: pillar.accent }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      {/* Deliberate stub — hints at grocery hand-off without building it. */}
      <Button variant="terra" className="w-full mt-1" onClick={() => setCartSheetOpen(true)}>
        Add to shopping cart
      </Button>

      <BottomSheet
        open={cartSheetOpen}
        onClose={() => setCartSheetOpen(false)}
        title="Shopping cart"
        subtitle={`${meal.ingredients.length} ingredients from ${meal.title}`}
      >
        <p className="text-[14px] leading-relaxed mb-4">
          Send these ingredients to your grocery order — coming soon.
        </p>
        <Button className="w-full" onClick={() => setCartSheetOpen(false)}>
          Got it
        </Button>
      </BottomSheet>
    </section>
  );
}

function MetaStat({
  label,
  value,
  divided = false,
}: {
  label: string;
  value: string;
  divided?: boolean;
}) {
  return (
    <div className={divided ? 'border-l border-line' : ''}>
      <div className="text-muted text-[11px] font-semibold uppercase tracking-wide">{label}</div>
      <div className="font-serif font-semibold text-[17px] mt-0.5">{value}</div>
    </div>
  );
}
