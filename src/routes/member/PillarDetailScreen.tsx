import { useMemo, useRef, useState } from 'react';
import { Card, ContentCard, Eyebrow, MealCard, ProductCard, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { contentForPillar, darken } from '@/utils/pillars';
import { mealsByTime } from '@/utils/meals';
import { shortDate } from '@/utils/format';
import type { PillarId } from '@/types';

interface Props {
  pillarId: PillarId;
  onBack: () => void;
  /** Wired on the pillars tab so a meal card can push the recipe screen. */
  onOpenMeal?: (id: string) => void;
  /** Contextual marketplace placement — a product card inside its pillar. */
  onOpenProduct?: (id: string) => void;
  /** PRD-04 painted door — the meal-delivery explainer (Nourishment only). */
  onOpenMealDelivery?: () => void;
}

export function PillarDetailScreen({
  pillarId,
  onBack,
  onOpenMeal,
  onOpenProduct,
  onOpenMealDelivery,
}: Props) {
  const data = useData();
  const toast = useToast();
  const pillar = getPillar(pillarId);
  const [mealFilter, setMealFilter] = useState<'all' | 'saved'>('all');
  const kitchenRef = useRef<HTMLDivElement>(null);

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const content = useStoreState((s) => s.content);
  const goals = useStoreState((s) => s.goals);
  const checkIns = useStoreState((s) => s.checkIns);
  const meals = useStoreState((s) => s.meals);
  const products = useStoreState((s) => s.products);

  // The contrarian placement bet: a couple of curated products inside the
  // pillar they serve, instead of relying on the standalone shop alone.
  const pillarProducts = useMemo(
    () => products.filter((p) => p.pillarId === pillarId).slice(0, 2),
    [products, pillarId],
  );

  const mealGroups = useMemo(
    () =>
      pillarId === 'nourishment'
        ? mealsByTime(mealFilter === 'saved' ? meals.filter((m) => m.saved) : meals)
        : [],
    [meals, mealFilter, pillarId],
  );

  function toggleSaveMeal(id: string) {
    const wasSaved = meals.find((m) => m.id === id)?.saved;
    data.toggleSaveMeal(id);
    if (wasSaved) {
      toast('Removed from your saved recipes.');
      return;
    }
    const award = data.awardPoints('save_recipe', id);
    toast(award ? `+${award.points} · ${award.label}` : 'Saved to your recipes.');
  }
  const items = useMemo(() => contentForPillar(content, pillarId), [content, pillarId]);
  const goal = useMemo(
    () => goals.find((g) => g.profileId === me.id && g.pillarId === pillarId && g.active),
    [goals, me.id, pillarId],
  );
  const pillarCheckIns = useMemo(
    () =>
      checkIns
        .filter(
          (c) =>
            c.memberId === me.id &&
            c.pillarId === pillarId &&
            c.status === 'completed' &&
            typeof c.goalScore === 'number',
        )
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [checkIns, me.id, pillarId],
  );

  return (
    <section className="px-5 pt-3 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-muted text-[13px] font-semibold mb-3 -ml-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Pillars
      </button>

      <div
        className="rounded-card p-5 text-white mb-4 shadow-card"
        style={{ background: `linear-gradient(135deg, ${pillar.accent}, ${darken(pillar.accent, 0.5)})` }}
      >
        <div className="w-12 h-12 rounded-[16px] bg-white/15 grid place-items-center mb-3">
          <span className="w-7 h-7 block [&_svg]:w-7 [&_svg]:h-7 [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-[1.6]">
            {pillarIcons[pillar.id]}
          </span>
        </div>
        <h2 className="font-serif font-semibold text-[23px] leading-tight">{pillar.label}</h2>
        <p className="text-[13.5px] text-white/85 mt-1">{pillar.tagline}</p>
      </div>

      <Card>
        <Eyebrow>What it covers</Eyebrow>
        <ul className="space-y-2 mt-1">
          {pillar.detail.map((d) => (
            <li key={d} className="flex gap-2.5 text-[14px] leading-snug">
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full flex-none"
                style={{ background: pillar.accent }}
              />
              {d}
            </li>
          ))}
        </ul>
      </Card>

      {goal && (
        <Card>
          <Eyebrow>Your goal</Eyebrow>
          <div className="font-semibold text-[15px]">{goal.title}</div>
          {goal.target && (
            <div className="text-muted text-[12.5px] mt-0.5">{goal.target} window</div>
          )}
        </Card>
      )}

      {pillarId === 'nourishment' && (
        <div ref={kitchenRef} className="mt-6 scroll-mt-4">
          <h3 className="font-serif font-semibold text-[19px]">From the retreat kitchen</h3>
          <p className="text-muted text-[13px] mt-0.5 mb-3">
            Recipes to take home — grouped by when you’d eat them.
          </p>
          <div className="flex gap-2 mb-1">
            {(
              [
                { key: 'all', label: 'All recipes' },
                { key: 'saved', label: 'Saved' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={mealFilter === f.key}
                onClick={() => setMealFilter(f.key)}
                className={[
                  'rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold border transition-colors',
                  mealFilter === f.key
                    ? 'bg-green text-cream border-green'
                    : 'bg-white text-muted border-line hover:border-sage',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>
          {onOpenMealDelivery && (
            <button
              type="button"
              onClick={onOpenMealDelivery}
              className="w-full text-left rounded-card border border-line bg-white shadow-card p-3.5 mt-3 mb-1 flex items-center gap-3.5 transition active:scale-[0.985] hover:border-sage"
            >
              <div
                className="w-12 h-12 rounded-[16px] grid place-items-center flex-none"
                style={{ background: `${pillar.accent}1f`, color: pillar.accent }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 11h16l-1.5 8.5a1.5 1.5 0 0 1-1.5 1.2H7a1.5 1.5 0 0 1-1.5-1.2Z" />
                  <path d="M12 11V7.5" />
                  <path d="M12 7.5a2.5 2.5 0 1 1 2.5-2.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold text-[17px] leading-tight">
                  Retreat meals, delivered
                </div>
                <div className="text-muted text-[12.5px] mt-0.5">
                  The kitchen you loved — at your door.
                </div>
              </div>
              <svg
                className="w-4 h-4 flex-none text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          )}
          {mealGroups.length > 0 ? (
            mealGroups.map((g) => (
              <div key={g.id}>
                <Eyebrow className="mt-4 mb-2">{g.label}</Eyebrow>
                {g.items.map((m) => (
                  <MealCard
                    key={m.id}
                    meal={m}
                    onOpen={(id) => onOpenMeal?.(id)}
                    onToggleSave={toggleSaveMeal}
                  />
                ))}
              </div>
            ))
          ) : (
            <Card className="mt-3">
              <p className="text-muted text-[13.5px]">
                Nothing saved yet — tap the bookmark on any recipe to keep it here.
              </p>
            </Card>
          )}
        </div>
      )}

      <Eyebrow className="mt-5 mb-2">This week</Eyebrow>
      {items.length > 0 ? (
        items.map((it) => (
          <ContentCard
            key={it.id}
            item={it}
            meId={me.id}
            onMarkDone={(id) => {
              data.markContentDone(id);
              const award = data.awardPoints('content_complete', id);
              return award ? `+${award.points} · ${award.label}` : undefined;
            }}
            onViewRecipes={
              pillarId === 'nourishment'
                ? () => {
                    setMealFilter('all');
                    kitchenRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                : undefined
            }
          />
        ))
      ) : (
        <Card>
          <p className="text-muted text-[13.5px]">Fresh content lands here every Monday.</p>
        </Card>
      )}

      {pillarProducts.length > 0 && onOpenProduct && (
        <>
          <Eyebrow className="mt-5 mb-2">From the marketplace</Eyebrow>
          {pillarProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpenProduct} />
          ))}
        </>
      )}

      {pillarCheckIns.length > 0 && (
        <>
          <Eyebrow className="mt-5 mb-2">Your check-ins</Eyebrow>
          <Card>
            {pillarCheckIns.map((c, i) => (
              <div
                key={c.id}
                className={[
                  'flex items-center justify-between gap-3 py-2.5',
                  i === pillarCheckIns.length - 1 ? '' : 'border-b border-line',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[13.5px]">{shortDate(c.scheduledAt)}</div>
                  {c.commitment && (
                    <div className="text-muted text-[12px] truncate">{c.commitment}</div>
                  )}
                </div>
                <div
                  className="flex-none font-serif font-semibold text-[15px]"
                  style={{ color: pillar.accent }}
                >
                  {c.goalScore}/10
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </section>
  );
}
