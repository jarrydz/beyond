import type { Meal } from '@/types';
import { darken } from '@/utils/pillars';
import { mealMeta } from '@/utils/meals';

interface Props {
  meal: Meal;
  onOpen: (id: string) => void;
  /** Provide to show the bookmark toggle (save arrives with the Saved filter). */
  onToggleSave?: (id: string) => void;
}

/**
 * One recipe as a compact row card — tinted thumbnail standing in for
 * photography, title, one meta line. Kitchen-scannable, ContentCard's visual
 * language without the 120px media header (twelve of those would bury the list).
 */
export function MealCard({ meal, onOpen, onToggleSave }: Props) {
  return (
    <div className="relative mb-2.5">
      <button
        type="button"
        onClick={() => onOpen(meal.id)}
        className="w-full text-left rounded-card border border-line bg-white shadow-card p-3 flex items-center gap-3.5 transition active:scale-[0.985] hover:border-sage"
      >
        <div
          className="w-[58px] h-[58px] rounded-[14px] flex-none"
          style={{
            background: `linear-gradient(135deg, ${meal.tint}, ${darken(meal.tint, 0.45)})`,
          }}
        />
        <div className="flex-1 min-w-0 pr-8">
          <div className="font-semibold text-[14.5px] leading-snug">{meal.title}</div>
          <div className="text-muted text-[12.5px] mt-0.5">{mealMeta(meal)}</div>
        </div>
      </button>
      {onToggleSave && (
        <button
          type="button"
          aria-label={meal.saved ? 'Remove from saved' : 'Save recipe'}
          aria-pressed={meal.saved}
          onClick={() => onToggleSave(meal.id)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full transition active:scale-90"
        >
          <BookmarkIcon filled={meal.saved} />
        </button>
      )}
    </div>
  );
}

export function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={['w-[18px] h-[18px]', filled ? 'text-green' : 'text-muted'].join(' ')}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4.5L5 21V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
