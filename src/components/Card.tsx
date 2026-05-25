import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Removes inner padding (e.g. for media cards). */
  flush?: boolean;
  /** Adds a subtle muted background, like the meet-up card in the prototype. */
  tone?: 'default' | 'sage' | 'dark' | 'terra';
}

const toneStyles: Record<NonNullable<CardProps['tone']>, string> = {
  default: 'bg-white border-line text-ink',
  sage: 'bg-[#F1F4ED] border-[#DCE4D5] text-ink',
  dark: 'bg-gradient-to-br from-green to-green-deep border-transparent text-cream',
  terra: 'bg-gradient-to-br from-terra to-terra-deep border-transparent text-white text-center',
};

export function Card({ children, flush, tone = 'default', className = '', ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        'rounded-card border shadow-card mb-3.5',
        flush ? 'overflow-hidden' : 'p-[18px]',
        toneStyles[tone],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={[
        'text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-2',
        className,
      ].join(' ')}
    >
      {children}
    </p>
  );
}
