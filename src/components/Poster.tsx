import type { CSSProperties, ReactNode } from 'react';
import type { ContentItem } from '@/types';

/**
 * The one renderer rule for content art (PRD-07 decision 2), stated once and
 * obeyed everywhere: prefer posterUrl, fall back to a gradient. No component
 * branches on "is this a prototype" — setting posterUrl on a row swaps the
 * art with zero code change.
 *
 * Design refresh: the fallback is a water-toned duotone keyed by format, not
 * the item's legacy tint — thumbnails stay in the palette until real imagery
 * lands.
 */
const DUOTONE: Record<string, string> = {
  audio: 'linear-gradient(160deg, #2C5259, #12262B)',
  video: 'linear-gradient(160deg, #5C8A8F, #2C5259)',
  default: 'linear-gradient(160deg, #3D6A72, #1B3940)',
};

export function Poster({
  item,
  className = '',
  style,
  children,
}: {
  item: Pick<ContentItem, 'posterUrl' | 'title'> & Partial<Pick<ContentItem, 'format' | 'tint'>>;
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
