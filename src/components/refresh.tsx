import type { ReactNode } from 'react';

/**
 * Small shared pieces of the design refresh: section header with the
 * zero-padded mono count, status chip, score pill. All Inter (interface),
 * per the serif-content / sans-interface rule.
 */

/** Uppercase eyebrow left, zero-padded mono count right, baseline aligned. */
export function SectionHeader({
  children,
  count,
  className = '',
}: {
  children: ReactNode;
  /** e.g. 5 → "05", or a preformatted string like "04 / 06". */
  count?: number | string;
  className?: string;
}) {
  return (
    <div className={['flex items-baseline justify-between mb-3', className].join(' ')}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
        {children}
      </span>
      {count !== undefined && (
        <span className="font-mono text-[10px] font-semibold text-quiet">
          {typeof count === 'number' ? String(count).padStart(2, '0') : count}
        </span>
      )}
    </div>
  );
}

/**
 * 9px uppercase square chip. Accent = needed/confirmed; neutral = timing.
 *
 * The accent tone is a sage-tinted outline, not a black fill. A prep list runs
 * five or six of these at once, and as solid black they shouted louder than the
 * headings they sat under — they're metadata, not the action. Black stays where
 * it earns attention: the urgent ScorePill below.
 */
export function StatusChip({
  tone = 'neutral',
  children,
}: {
  tone?: 'accent' | 'neutral';
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-block px-1.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em]',
        tone === 'accent'
          ? 'bg-primary/10 text-primary-800 border border-primary/40'
          : 'bg-grey-150 text-muted',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

/** Mono score pill — quiet fill normally, accent when it needs action now. */
export function ScorePill({
  urgent = false,
  children,
}: {
  urgent?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-block rounded-[4px] px-2 py-[5px] font-mono text-[11px] font-semibold',
        urgent ? 'bg-accent text-cream' : 'bg-grey-50 text-ink',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
