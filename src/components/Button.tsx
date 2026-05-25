import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'terra';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  /** When true, the button shrinks to fit its content instead of filling the row. */
  inline?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-green text-cream hover:brightness-110',
  ghost: 'bg-transparent text-green border border-sage hover:bg-sage/10',
  terra: 'bg-terra text-white hover:brightness-110',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  inline = false,
  type,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type ?? 'button'}
      className={[
        'font-semibold text-sm rounded-btn px-[18px] py-[13px] transition active:scale-[0.975] disabled:opacity-50 disabled:pointer-events-none',
        inline ? 'inline-flex items-center justify-center' : 'w-full',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5 [&>button]:flex-1 [&>button]:w-auto">{children}</div>;
}
