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
 * 9px uppercase pill. Accent = needed/confirmed; neutral = timing.
 *
 * Soft warm fill, no outline. A prep list runs five or six of these at once, so
 * a black fill shouted louder than the headings above it and a bordered box read
 * like an input field — they're metadata, not the action. Black stays where it
 * earns attention: the urgent ScorePill below.
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
        'inline-block rounded-full px-2.5 py-[4px] text-[9px] font-semibold uppercase tracking-[0.1em]',
        tone === 'accent' ? 'bg-primary-wash text-primary-800' : 'bg-grey-100 text-ink/75',
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
        'inline-block rounded-full px-2.5 py-[5px] font-mono text-[11px] font-semibold',
        urgent ? 'bg-accent text-cream' : 'bg-grey-50 text-ink',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
