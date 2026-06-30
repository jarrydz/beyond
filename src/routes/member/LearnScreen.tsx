import { useMemo } from 'react';
import { ContentCard, Eyebrow } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { contentByPillar } from '@/utils/pillars';

export function LearnScreen() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const content = useStoreState((s) => s.content);

  const groups = useMemo(() => contentByPillar(content), [content]);

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">This week</h2>
      <p className="text-muted text-[13.5px] mb-4">
        Recipes, movement and reflections across your Five Pillars — refreshed every Monday.
      </p>

      {groups.map((g) => {
        const pillar = getPillar(g.pillarId);
        return (
          <div key={g.pillarId}>
            <div className="flex items-center gap-2 mt-1 mb-2">
              <span
                className="w-2 h-2 rounded-full flex-none"
                style={{ background: pillar.accent }}
              />
              <span
                className="text-[12.5px] font-semibold tracking-wide"
                style={{ color: pillar.accent }}
              >
                {pillar.label}
              </span>
            </div>
            {g.items.map((it) => (
              <ContentCard key={it.id} item={it} meId={me.id} />
            ))}
          </div>
        );
      })}
    </section>
  );
}
