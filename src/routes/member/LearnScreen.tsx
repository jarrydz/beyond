import { useMemo, useState } from 'react';
import { Avatar, Button, ButtonRow, Card, Eyebrow, useToast } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import type { ContentItem } from '@/types';

export function LearnScreen() {
  const toast = useToast();
  const content = useStoreState((s) => s.content);
  const coach = useStoreState(
    (s) => s.profiles.find((p) => p.role === 'coach' && p.cohortId === s.cohort.id)!,
  );

  const recipe = useMemo(() => content.find((c) => c.type === 'recipe'), [content]);
  const movement = useMemo(() => content.find((c) => c.type === 'movement'), [content]);
  const event = useMemo(() => content.find((c) => c.type === 'event'), [content]);

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">This week</h2>
      <p className="text-muted text-[13.5px] mb-4">
        Recipes, movement and reflections — refreshed every Monday
      </p>

      {recipe && <RecipeCard item={recipe} />}

      {movement && (
        <Card flush>
          <div
            className="h-[150px] flex items-end p-3.5 relative"
            style={{ background: 'linear-gradient(135deg,#9DB0AE,#5C7470)' }}
          >
            <span className="text-white font-semibold text-sm drop-shadow">{movement.title}</span>
            <div className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-white/85 grid place-items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A5145">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="p-3.5 px-4">
            <div className="font-semibold text-[15px]">3 movement sessions</div>
            <div className="text-muted text-[13px]">
              Filmed by {coach.fullName.split(' ')[0]}. Do them anywhere, any level.
            </div>
          </div>
        </Card>
      )}

      {event && (
        <Card>
          <Eyebrow>Live this week</Eyebrow>
          <div className="flex items-center gap-3">
            <Avatar
              profile={{
                id: 'chef',
                fullName: 'Chef',
                avatarInitial: 'C',
                role: 'coach',
                cohortId: '',
                onboarded: true,
              }}
              style={{ background: '#8C7B9C' }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14.5px]">{event.title}</div>
              <div className="text-muted text-[12.5px]">{event.description}</div>
            </div>
            <button
              type="button"
              onClick={() => toast("You're registered for Wednesday")}
              className="font-semibold text-[13px] rounded-btn px-3.5 py-2 bg-terra text-white transition active:scale-[0.975]"
            >
              RSVP
            </button>
          </div>
        </Card>
      )}
    </section>
  );
}

function RecipeCard({ item }: { item: ContentItem }) {
  const toast = useToast();
  const [showList, setShowList] = useState(false);
  const shoppingList: string[] = item.payload?.shoppingList ?? [];

  return (
    <Card flush>
      <div
        className="h-[150px] flex items-end p-3.5"
        style={{ background: 'linear-gradient(135deg,#E7B79E,#C97B5A)' }}
      >
        <span className="text-white font-semibold text-sm drop-shadow">Nourish bowl · 20 min</span>
      </div>
      <div className="p-3.5 px-4">
        <div className="font-semibold text-[15px]">{item.title}</div>
        {item.description && (
          <div className="text-muted text-[13px] mt-0.5 mb-3">{item.description}</div>
        )}
        <ButtonRow>
          <Button variant="ghost" onClick={() => toast('Recipe cards opening…')}>
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
      </div>
    </Card>
  );
}
