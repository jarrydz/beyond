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

/** One library row: the poster (or tint), title, format · duration · presenter. */
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
      className="w-full text-left rounded-card border border-line bg-white shadow-card p-3 flex items-center gap-3 transition active:scale-[0.985] hover:border-sage"
    >
      <Poster item={item} className="w-12 h-12 rounded-[14px] flex-none grid place-items-center">
        {(item.format === 'video' || item.format === 'audio') && (
          <span className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-white/85 grid place-items-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#3A5145" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </Poster>
      <div className="flex-1 min-w-0">
        <div
          className={[
            'font-semibold text-[14px] leading-tight',
            done ? 'text-muted' : '',
          ].join(' ')}
        >
          {item.title}
        </div>
        <div className="text-muted text-[12px] mt-0.5 truncate">{meta}</div>
      </div>
      {done ? (
        <span className="w-[20px] h-[20px] rounded-full bg-green grid place-items-center flex-none">
          <svg className="w-3 h-3 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      ) : (
        <svg
          className="w-4 h-4 flex-none text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
