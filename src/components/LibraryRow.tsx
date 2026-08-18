import { Poster } from '.';
import type { ContentFormat, ContentItem } from '@/types';

/** Member-voice labels for the modalities band. */
export const FORMAT_LABEL: Record<ContentFormat, string> = {
  interactive: 'Do',
  video: 'Watch',
  audio: 'Listen',
  read: 'Read',
};

interface Props {
  item: ContentItem;
  meId: string;
  onOpen: (id: string) => void;
}

/**
 * One library row (design refresh): a flat hairline row — no border, no fill.
 * 56px duotone thumb, serif title, mono uppercase meta (DO · 2 MIN · LUCY).
 * The parent list owns the top hairline; each row draws its bottom one.
 */
export function LibraryRow({ item, meId, onOpen }: Props) {
  const done = item.doneBy.includes(meId);
  const meta = [
    FORMAT_LABEL[item.format],
    item.durationMin ? `${item.durationMin} min` : null,
    item.presenter ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="w-full text-left flex items-center gap-3.5 py-3.5 border-b border-line"
    >
      <Poster item={item} className="w-14 h-14 rounded-[8px] flex-none grid place-items-center">
        {(item.format === 'video' || item.format === 'audio') && (
          <span className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-white/90 grid place-items-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#12262B" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </Poster>
      <div className="flex-1 min-w-0">
        <div
          className={[
            'font-serif font-medium text-[16.5px] leading-tight',
            done ? 'text-muted' : 'text-ink',
          ].join(' ')}
        >
          {item.title}
        </div>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-quiet mt-1 truncate">
          {meta}
        </div>
      </div>
      {done ? (
        <span className="w-[20px] h-[20px] rounded-full bg-ink grid place-items-center flex-none">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      ) : (
        <svg
          className="w-[15px] h-[15px] flex-none text-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
