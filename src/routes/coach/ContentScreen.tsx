import { useMemo, type ReactNode } from 'react';
import { Card } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { getPillar } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import { contentByPillar } from '@/utils/pillars';
import type { ContentItem, ContentType } from '@/types';

const TYPE_ICONS: Partial<Record<ContentType, ReactNode>> = {
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
  breathwork: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 12h6a3 3 0 1 0-3-3" />
      <path d="M4 16h10a3 3 0 1 1-3 3" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 14.5A8 8 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" />
    </svg>
  ),
  nature: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 19c-1-8 5-15 14-15 1 9-5 16-14 15Z" />
      <path d="M5 19c2.5-4 6-6.5 10-8" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </svg>
  ),
};

const fallbackIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </svg>
);

export function ContentScreen() {
  const content = useStoreState((s) => s.content);
  const memberCount = useStoreState(
    (s) => s.profiles.filter((p) => p.role === 'member' && p.cohortId === s.cohort.id).length,
  );

  const groups = useMemo(() => contentByPillar(content), [content]);

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">This week</h2>
      <p className="text-muted text-[13.5px] mb-4">
        What your {memberCount} members receive across the Pillars.
      </p>

      {groups.map((g) => {
        const pillar = getPillar(g.pillarId);
        return (
          <div key={g.pillarId}>
            <div className="flex items-center gap-2 mb-2 mt-1">
              <span
                className="w-5 h-5 rounded-full grid place-items-center flex-none [&_svg]:w-3 [&_svg]:h-3 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.9]"
                style={{ background: `${pillar.accent}1f`, color: pillar.accent }}
              >
                {pillarIcons[pillar.id]}
              </span>
              <span
                className="text-[12.5px] font-semibold tracking-wide"
                style={{ color: pillar.accent }}
              >
                {pillar.label}
              </span>
            </div>
            <div className="space-y-2.5 mb-4">
              {g.items.map((it) => (
                <Row key={it.id} item={it} memberCount={memberCount} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Row({ item, memberCount }: { item: ContentItem; memberCount: number }) {
  return (
    <Card className="!mb-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-sand text-green grid place-items-center flex-none">
          <span className="w-[18px] h-[18px] block [&_svg]:w-[18px] [&_svg]:h-[18px]">
            {TYPE_ICONS[item.type] ?? fallbackIcon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[14.5px] truncate">{item.title}</div>
          {item.description && (
            <div className="text-muted text-[12.5px] mt-0.5 leading-snug">{item.description}</div>
          )}
          {item.type !== 'event' && memberCount > 0 && (
            <div className="text-[11.5px] text-green-soft font-semibold mt-1.5">
              {item.doneBy.length}/{memberCount} marked done
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
