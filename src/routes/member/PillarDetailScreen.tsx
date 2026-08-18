import { useMemo, useRef, useState } from 'react';
import {
  BottomSheet,
  Button,
  FORMAT_LABEL,
  GoalWhyForm,
  LibraryRow,
  MealCard,
  Poster,
  ProductCard,
  ScorePill,
  SectionHeader,
  Sheet,
  WaterHeader,
  useToast,
} from '@/components';
import { VideoOverlay } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { contentForPillar } from '@/utils/pillars';
import { mealsByTime } from '@/utils/meals';
import { daysUntil } from '@/utils/journey';
import { shortDate } from '@/utils/format';
import type { ContentItem, PillarId } from '@/types';

interface Props {
  pillarId: PillarId;
  onBack: () => void;
  /** Wired on the pillars tab so a meal card can push the recipe screen. */
  onOpenMeal?: (id: string) => void;
  /** Contextual marketplace placement — a product card inside its pillar. */
  onOpenProduct?: (id: string) => void;
  /** PRD-04 painted door — the meal-delivery explainer (Nourishment only). */
  onOpenMealDelivery?: () => void;
  /** PRD-07 — open a library item's detail screen. */
  onOpenContent?: (id: string) => void;
}

/**
 * Pillar detail (design refresh, screen 9a): full-bleed water header carrying
 * the pillar name, the goal as context (with the focus bar when this pillar
 * is the focus), then a white sheet of flat hairline lists. "This week" is
 * the one raised block on the page — nothing else carries a shadow. Acid is
 * rationed to the play button and the primary action.
 */
export function PillarDetailScreen({
  pillarId,
  onBack,
  onOpenMeal,
  onOpenProduct,
  onOpenMealDelivery,
  onOpenContent,
}: Props) {
  const data = useData();
  const toast = useToast();
  const pillar = getPillar(pillarId);
  const [mealFilter, setMealFilter] = useState<'all' | 'saved'>('all');
  const [changeOpen, setChangeOpen] = useState(false);
  const kitchenRef = useRef<HTMLDivElement>(null);

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const content = useStoreState((s) => s.content);
  const library = useStoreState((s) => s.library);
  const goals = useStoreState((s) => s.goals);
  const checkIns = useStoreState((s) => s.checkIns);
  const meals = useStoreState((s) => s.meals);
  const products = useStoreState((s) => s.products);
  const offset = useStoreState((s) => s.demoDayOffset);

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

  // Focus progress on the sim clock — same fraction as the Pillars screen.
  const totalDays = goal?.target === '100 days' ? 100 : 30;
  const setAt = goal?.focusSetAt ?? goal?.createdAt;
  const dayIndex = setAt
    ? Math.max(1, Math.min(totalDays, -daysUntil(setAt, offset) + 1))
    : 1;
  const pct = Math.round((dayIndex / totalDays) * 100);

  function markDone(id: string) {
    data.markContentDone(id);
    const award = data.awardPoints('content_complete', id);
    toast(award ? `+${award.points} · ${award.label}` : 'Nice. Streak kept.');
  }

  function viewRecipes() {
    setMealFilter('all');
    kitchenRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const doneCount = items.filter((it) => it.doneBy.includes(me.id)).length;
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <>
      <WaterHeader
        depth="deep"
        back={{ label: 'Pillars', onClick: onBack }}
        showPoints={false}
        showProfile={false}
      >
        <h1 className="font-serif font-normal text-[38px] leading-[1.05] mb-2">
          {pillar.label}
        </h1>
        <p className="font-serif text-[14.5px] leading-relaxed text-white/[.68] max-w-[300px]">
          {pillar.tagline}
        </p>

        {goal && (
          <div className="mt-6 pt-4 border-t border-white/[.14]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Your goal
              </span>
              <button
                type="button"
                onClick={() => setChangeOpen(true)}
                className="text-[12.5px] font-semibold text-white/85 underline underline-offset-[3px] transition hover:text-white"
              >
                Change
              </button>
            </div>
            <div className="font-serif text-[19px] leading-snug">{goal.title}</div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-[4px] rounded-[2px] bg-white/[.22] overflow-hidden">
                <div className="h-full bg-acid" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-[10px] font-semibold text-white/70">
                DAY {String(dayIndex).padStart(2, '0')} / {totalDays}
              </span>
            </div>
          </div>
        )}
      </WaterHeader>

      <Sheet>
        <SectionHeader count={pillar.detail.length}>What it covers</SectionHeader>
        <div className="mb-7">
          {pillar.detail.map((d, i) => (
            <div
              key={d}
              className={[
                'flex items-baseline gap-3.5 py-3.5 border-t border-line',
                i === pillar.detail.length - 1 ? 'border-b' : '',
              ].join(' ')}
            >
              <span className="font-mono text-[10px] font-semibold text-quiet w-[22px] flex-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-[16.5px] leading-snug text-ink">{d}</span>
            </div>
          ))}
        </div>

        {pillarId === 'nourishment' && (
          <div ref={kitchenRef} className="mb-7 scroll-mt-4">
            <SectionHeader>From the retreat kitchen</SectionHeader>
            <p className="text-muted text-[13px] -mt-2 mb-3">
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
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-muted border-line hover:border-ink/40',
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
                className="w-full text-left flex items-center gap-3.5 py-3.5 mt-2 border-t border-b border-line"
              >
                <div className="w-14 h-14 rounded-[8px] bg-grey-100 text-icon-quiet grid place-items-center flex-none">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 11h16l-1.5 8.5a1.5 1.5 0 0 1-1.5 1.2H7a1.5 1.5 0 0 1-1.5-1.2Z" />
                    <path d="M12 11V7.5" />
                    <path d="M12 7.5a2.5 2.5 0 1 1 2.5-2.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-medium text-[16.5px] leading-tight text-ink">
                    Retreat meals, delivered
                  </div>
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-quiet mt-1">
                    The kitchen you loved · At your door
                  </div>
                </div>
                <svg
                  className="w-[15px] h-[15px] flex-none text-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}
            {mealGroups.length > 0 ? (
              mealGroups.map((g) => (
                <div key={g.id}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted mt-4 mb-2">
                    {g.label}
                  </div>
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
              <p className="text-muted text-[13.5px] mt-4">
                Nothing saved yet — tap the bookmark on any recipe to keep it here.
              </p>
            )}
          </div>
        )}

        <SectionHeader count={items.length}>This week</SectionHeader>
        {featured ? (
          <FeaturedWeekly
            item={featured}
            meId={me.id}
            doneCount={doneCount}
            total={items.length}
            onMarkDone={markDone}
            onViewRecipes={pillarId === 'nourishment' ? viewRecipes : undefined}
          />
        ) : (
          <p className="text-muted text-[13.5px]">Fresh content lands here every Monday.</p>
        )}
        {rest.length > 0 && (
          <div className="mt-4 border-t border-line">
            {rest.map((it) => (
              <WeeklyRow
                key={it.id}
                item={it}
                meId={me.id}
                onMarkDone={markDone}
                onViewRecipes={pillarId === 'nourishment' ? viewRecipes : undefined}
              />
            ))}
          </div>
        )}

        {onOpenContent && (
          <div className="mt-7">
            <LibrarySection
              items={library.filter((c) => c.pillarId === pillarId)}
              meId={me.id}
              onOpen={onOpenContent}
            />
          </div>
        )}

        {pillarProducts.length > 0 && onOpenProduct && (
          <div className="mt-7">
            <SectionHeader count={pillarProducts.length}>From the marketplace</SectionHeader>
            {pillarProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={onOpenProduct} />
            ))}
          </div>
        )}

        {pillarCheckIns.length > 0 && (
          <div className="mt-7">
            <SectionHeader count={pillarCheckIns.length}>Your check-ins</SectionHeader>
            {pillarCheckIns.map((c, i) => (
              <div
                key={c.id}
                className={[
                  'flex items-center gap-3.5 py-4 border-t border-line',
                  i === pillarCheckIns.length - 1 ? 'border-b' : '',
                ].join(' ')}
              >
                <span className="font-mono text-[9px] font-semibold uppercase text-quiet w-[44px] flex-none">
                  {shortDate(c.scheduledAt)}
                </span>
                <span className="flex-1 min-w-0 text-[12.5px] text-muted truncate">
                  {c.commitment ?? 'Check-in'}
                </span>
                <ScorePill>{c.goalScore}/10</ScorePill>
              </div>
            ))}
          </div>
        )}
      </Sheet>

      <BottomSheet
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        title="Change your goal"
        subtitle="Sharpen the wording, the window, or the why — same focus."
      >
        <GoalWhyForm
          pillarId={pillarId}
          initialTitle={goal?.title}
          initialWhy={goal?.why}
          cta="Save the change"
          onSaved={() => {
            setChangeOpen(false);
            toast('Goal updated.');
          }}
        />
      </BottomSheet>
    </>
  );
}

/**
 * The one raised block on the page: 184px media area with the acid play
 * button, then the serif title and the primary action beside the honest
 * week counter. Shadow 0 10px 30px — nothing else on the screen carries one.
 */
function FeaturedWeekly({
  item,
  meId,
  doneCount,
  total,
  onMarkDone,
  onViewRecipes,
}: {
  item: ContentItem;
  meId: string;
  doneCount: number;
  total: number;
  onMarkDone: (id: string) => void;
  onViewRecipes?: () => void;
}) {
  const toast = useToast();
  const [showList, setShowList] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const done = item.doneBy.includes(meId);
  const shoppingList: string[] = item.payload?.shoppingList ?? [];
  const isVideo = item.format === 'video';

  return (
    <div
      className="rounded-tile overflow-hidden bg-white"
      style={{ boxShadow: '0 10px 30px rgba(18,38,43,.14)' }}
    >
      <Poster item={item} className="h-[184px]">
        {isVideo ? (
          <button
            type="button"
            aria-label="Play the video"
            onClick={() => setVideoOpen(true)}
            className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-acid grid place-items-center transition active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#12262B" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <span className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-acid grid place-items-center pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#12262B" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </Poster>
      {isVideo && (
        <VideoOverlay
          item={item}
          open={videoOpen}
          onClose={() => {
            setVideoOpen(false);
            // The interaction completes — but only for markable items;
            // events keep RSVP as their action, recipes keep View recipes.
            if (!done && item.type !== 'event' && item.type !== 'recipe') {
              onMarkDone(item.id);
            }
          }}
        />
      )}
      <div className="p-5">
        <div className="font-serif font-medium text-[21px] leading-tight text-ink">
          {item.title}
        </div>
        {item.description && (
          <p className="text-[13px] text-muted leading-relaxed mt-1.5">{item.description}</p>
        )}
        <div className="flex items-center gap-3.5 mt-4">
          {item.type === 'recipe' ? (
            <Button inline variant="acid" className="px-5 !py-2.5" onClick={() => onViewRecipes?.()}>
              View recipes
            </Button>
          ) : item.type === 'event' ? (
            <Button
              inline
              variant="acid"
              className="px-5 !py-2.5"
              onClick={() => toast("You're registered for Wednesday")}
            >
              RSVP
            </Button>
          ) : done ? (
            <Button
              inline
              variant="ghost"
              className="px-5 !py-2.5"
              onClick={() => toast('Already done today.')}
            >
              Done ✓
            </Button>
          ) : (
            <Button inline variant="acid" className="px-5 !py-2.5" onClick={() => onMarkDone(item.id)}>
              Mark as done
            </Button>
          )}
          <span className="font-mono text-[10px] font-semibold uppercase text-quiet">
            {doneCount} of {total} this week
          </span>
        </div>
        {item.type === 'recipe' && (
          <>
            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="mt-3 text-[12.5px] font-semibold text-ink underline underline-offset-[3px]"
            >
              {showList ? 'Hide the shopping list' : 'Shopping list'}
            </button>
            {showList && shoppingList.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                {shoppingList.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-icon-quiet" />
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Additional weekly items as flat hairline rows — same behaviours, no chrome. */
function WeeklyRow({
  item,
  meId,
  onMarkDone,
  onViewRecipes,
}: {
  item: ContentItem;
  meId: string;
  onMarkDone: (id: string) => void;
  onViewRecipes?: () => void;
}) {
  const toast = useToast();
  const done = item.doneBy.includes(meId);

  const action =
    item.type === 'recipe' ? (
      <button
        type="button"
        onClick={() => onViewRecipes?.()}
        className="text-[12.5px] font-semibold text-ink underline underline-offset-[3px] flex-none"
      >
        Recipes
      </button>
    ) : item.type === 'event' ? (
      <button
        type="button"
        onClick={() => toast("You're registered for Wednesday")}
        className="text-[12.5px] font-semibold text-ink underline underline-offset-[3px] flex-none"
      >
        RSVP
      </button>
    ) : done ? (
      <span className="w-[20px] h-[20px] rounded-full bg-ink grid place-items-center flex-none">
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
    ) : (
      <button
        type="button"
        onClick={() => onMarkDone(item.id)}
        className="text-[12.5px] font-semibold text-ink underline underline-offset-[3px] flex-none"
      >
        Mark done
      </button>
    );

  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-line">
      <Poster item={item} className="w-14 h-14 rounded-[8px] flex-none" />
      <div className="flex-1 min-w-0">
        <div
          className={[
            'font-serif font-medium text-[16.5px] leading-tight',
            done ? 'text-muted' : 'text-ink',
          ].join(' ')}
        >
          {item.title}
        </div>
        {item.description && (
          <div className="text-[12px] text-muted mt-0.5 truncate">{item.description}</div>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * The stocked shelf (PRD-07): the pillar's library, grouped by format in
 * member-voice groups — Do, Watch, Listen, Read — as flat hairline rows.
 */
function LibrarySection({
  items,
  meId,
  onOpen,
}: {
  items: ContentItem[];
  meId: string;
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const groups = (['interactive', 'video', 'audio', 'read'] as const)
    .map((f) => ({ format: f, rows: items.filter((c) => c.format === f) }))
    .filter((g) => g.rows.length > 0);
  return (
    <div className="mb-7">
      <SectionHeader count={items.length}>The library</SectionHeader>
      <p className="text-muted text-[13px] -mt-2 mb-2">
        Practices from the retreat, yours to run at home.
      </p>
      {groups.map((g) => (
        <div key={g.format}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted mt-4 mb-1">
            {FORMAT_LABEL[g.format]}
          </div>
          <div className="border-t border-line">
            {g.rows.map((c) => (
              <LibraryRow key={c.id} item={c} meId={meId} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
