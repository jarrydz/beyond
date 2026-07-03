import { useState } from 'react';
import type { ContentItem } from '@/types';
import { getPillar } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { darken } from '@/utils/pillars';
import { Card } from './Card';
import { Button, ButtonRow } from './Button';
import { useToast } from './Toast';

const PLAY_TYPES = new Set<ContentItem['type']>(['movement', 'breathwork']);

interface Props {
  item: ContentItem;
  /** Current member id — controls the done state. */
  meId: string;
  /**
   * Provide to show a "Mark as done" action (omit on read-only surfaces like
   * Learn). May return a string to use as the toast (e.g. a points award).
   */
  onMarkDone?: (id: string) => string | void;
  /** Show a pillar pill on the media header (for multi-pillar lists). */
  showPillar?: boolean;
  /** Recipe cards: jump to the retreat-kitchen library instead of the placeholder toast. */
  onViewRecipes?: () => void;
}

/**
 * One content item as a media card, tinted by its pillar accent. Reused on the
 * pillar detail, Grow and Learn screens so the pillar reads consistently.
 */
export function ContentCard({ item, meId, onMarkDone, showPillar = false, onViewRecipes }: Props) {
  const toast = useToast();
  const pillar = getPillar(item.pillarId);
  const [showList, setShowList] = useState(false);

  const done = item.doneBy.includes(meId);
  const shoppingList: string[] = item.payload?.shoppingList ?? [];

  return (
    <Card flush>
      <div
        className="h-[120px] relative"
        style={{ background: `linear-gradient(135deg, ${pillar.accent}, ${darken(pillar.accent, 0.5)})` }}
      >
        {showPillar && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
            <span className="w-3.5 h-3.5 block [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-[1.8]">
              {pillarIcons[pillar.id]}
            </span>
            {pillar.label}
          </span>
        )}
        {PLAY_TYPES.has(item.type) && (
          <div className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-white/85 grid place-items-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A5145">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3.5 px-4">
        <div className="font-semibold text-[15px]">{item.title}</div>
        {item.description && (
          <div className="text-muted text-[13px] mt-0.5 mb-3">{item.description}</div>
        )}

        {item.type === 'recipe' ? (
          <>
            <ButtonRow>
              <Button
                variant="ghost"
                onClick={() => (onViewRecipes ? onViewRecipes() : toast('Recipe cards opening…'))}
              >
                View recipes
              </Button>
              <Button variant="ghost" onClick={() => setShowList((v) => !v)}>
                {showList ? 'Hide list' : 'Shopping list'}
              </Button>
            </ButtonRow>
            {showList && shoppingList.length > 0 && (
              <ul className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                {shoppingList.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-sage" />
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : item.type === 'event' ? (
          <Button variant="terra" onClick={() => toast("You're registered for Wednesday")}>
            RSVP
          </Button>
        ) : onMarkDone ? (
          done ? (
            <Button className="!bg-green-soft" onClick={() => toast('Already done today.')}>
              Done ✓
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                const msg = onMarkDone(item.id);
                toast(typeof msg === 'string' ? msg : 'Nice. Streak kept.');
              }}
            >
              Mark as done
            </Button>
          )
        ) : null}
      </div>
    </Card>
  );
}
