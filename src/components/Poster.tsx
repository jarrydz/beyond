import type { CSSProperties, ReactNode } from 'react';
import { darken } from '@/utils/pillars';
import type { ContentItem } from '@/types';

/**
 * The one renderer rule for content art (PRD-07 decision 2), stated once and
 * obeyed everywhere: prefer posterUrl, fall back to the tint gradient. No
 * component branches on "is this a prototype" — setting posterUrl on a row
 * swaps the art with zero code change.
 */
export function Poster({
  item,
  className = '',
  style,
  children,
}: {
  item: Pick<ContentItem, 'posterUrl' | 'tint' | 'title'>;
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
        background: `linear-gradient(135deg, ${item.tint}, ${darken(item.tint, 0.45)})`,
      }}
    >
      {children}
    </div>
  );
}
