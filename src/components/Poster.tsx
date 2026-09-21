import type { CSSProperties, ReactNode } from 'react';
import type { ContentItem } from '@/types';

/**
 * The one renderer rule for content art (PRD-07 decision 2), stated once and
 * obeyed everywhere: prefer posterUrl, fall back to a gradient. No component
 * branches on "is this a prototype" — setting posterUrl on a row swaps the
 * art with zero code change.
 *
 * Design refresh: the fallback is a sage-toned duotone keyed by format, not
 * the item's legacy tint — thumbnails stay in the palette until real imagery
 * lands.
 */
const DUOTONE: Record<string, string> = {
  audio: 'linear-gradient(160deg, #56685E, #1D2420)',
  video: 'linear-gradient(160deg, #8A9B92, #56685E)',
  default: 'linear-gradient(160deg, #697F73, #2F3934)',
};

export function Poster({
  item,
  className = '',
  style,
  children,
}: {
  item: Pick<ContentItem, 'posterUrl' | 'title'> &
    Partial<Pick<ContentItem, 'format' | 'tint'>> & {
      /** CSS object-position for the photo — face-safe crops on portraits. */
      posterPosition?: string;
    };
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  if (item.posterUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        <img
          src={item.posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={item.posterPosition ? { objectPosition: item.posterPosition } : undefined}
        />
        {children}
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        background: DUOTONE[item.format ?? 'default'] ?? DUOTONE.default,
      }}
    >
      {children}
    </div>
  );
}
