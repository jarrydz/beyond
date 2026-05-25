import type { ReactNode } from 'react';

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
}

export function BottomNav({ items, active, onChange }: BottomNavProps) {
  return (
    <nav className="absolute bottom-0 inset-x-0 h-[76px] bg-white/90 backdrop-blur border-t border-line flex pb-2 z-[55]">
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors',
              on ? 'text-green' : 'text-muted',
            ].join(' ')}
          >
            <span
              className={['[&_svg]:w-[23px] [&_svg]:h-[23px] [&_svg]:fill-none [&_svg]:stroke-[1.7]', on ? '[&_svg]:stroke-green' : '[&_svg]:stroke-muted'].join(' ')}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/* Line icons matching the prototype. */
export const NavIcons = {
  home: (
    <svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ),
  group: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M16 14.5a4.6 4.6 0 0 1 4.5 4.5" />
    </svg>
  ),
  coach: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24">
      <path d="M4 5.5A2 2 0 0 1 6 4h6v15H6a2 2 0 0 0-2 1.5Z" />
      <path d="M20 5.5A2 2 0 0 0 18 4h-6v15h6a2 2 0 0 1 2 1.5Z" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <rect x="7" y="11" width="3" height="5" />
      <rect x="12" y="8" width="3" height="8" />
      <rect x="17" y="13" width="3" height="3" />
    </svg>
  ),
  today: (
    <svg viewBox="0 0 24 24">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </svg>
  ),
  members: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M16 14.5a4.6 4.6 0 0 1 4.5 4.5" />
    </svg>
  ),
  content: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
};
