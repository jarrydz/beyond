import { useMemo } from 'react';
import { Card, Eyebrow } from '@/components';
import { useStoreState } from '@/store/StoreProvider';

const ICONS = {
  recipe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 4h14l-1.5 16H6.5L5 4Z" />
      <path d="M9 8h6" />
    </svg>
  ),
  movement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="m10 9 6 3-6 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </svg>
  ),
  affirmation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 12c0 4-3.5 7-9 9-5.5-2-9-5-9-9V6l9-3 9 3v6Z" />
    </svg>
  ),
};

export function ContentScreen() {
  const content = useStoreState((s) => s.content);
  const memberCount = useStoreState(
    (s) => s.profiles.filter((p) => p.role === 'member' && p.cohortId === s.cohort.id).length,
  );

  const byType = useMemo(() => {
    return {
      recipes: content.filter((c) => c.type === 'recipe'),
      movement: content.filter((c) => c.type === 'movement'),
      events: content.filter((c) => c.type === 'event'),
    };
  }, [content]);

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">This week</h2>
      <p className="text-muted text-[13.5px] mb-4">
        What your {memberCount} members receive in Learn.
      </p>

      <Section title="Recipes" items={byType.recipes} memberCount={memberCount} />
      <Section title="Movement" items={byType.movement} memberCount={memberCount} />
      <Section title="Live events" items={byType.events} memberCount={memberCount} />
    </section>
  );
}

function Section({
  title,
  items,
  memberCount,
}: {
  title: string;
  items: { id: string; type: keyof typeof ICONS; title: string; description?: string; doneBy: string[] }[];
  memberCount: number;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <Eyebrow className="mb-2">{title}</Eyebrow>
      <div className="space-y-2.5 mb-2">
        {items.map((it) => (
          <Card key={it.id} className="!mb-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-sand text-green grid place-items-center flex-none">
                <span className="w-[18px] h-[18px] block [&_svg]:w-[18px] [&_svg]:h-[18px]">
                  {ICONS[it.type]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px] truncate">{it.title}</div>
                {it.description && (
                  <div className="text-muted text-[12.5px] mt-0.5 leading-snug">
                    {it.description}
                  </div>
                )}
                {it.type !== 'event' && memberCount > 0 && (
                  <div className="text-[11.5px] text-green-soft font-semibold mt-1.5">
                    {it.doneBy.length}/{memberCount} marked done
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="h-3" />
    </>
  );
}
