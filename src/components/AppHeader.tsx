import { useState } from 'react';
import { RoleSwitcherSheet } from './RoleSwitcherSheet';
import { useStoreState } from '@/store/StoreProvider';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [sheet, setSheet] = useState(false);
  const activeRole = useStoreState((s) => s.activeRole);

  return (
    <>
      <div className="flex items-start justify-between px-5 pt-2 pb-1">
        <div>
          <h2 className="font-serif font-semibold text-[25px] leading-tight">{title}</h2>
          {subtitle && <p className="text-muted text-[13.5px] mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setSheet(true)}
          aria-label="Switch role"
          className="mt-1 flex items-center gap-1.5 text-[11px] tracking-[0.13em] uppercase font-semibold text-green-soft px-2.5 py-1.5 rounded-full border border-line bg-white hover:border-sage transition-colors"
        >
          <span
            className={[
              'w-1.5 h-1.5 rounded-full',
              activeRole === 'coach' ? 'bg-terra' : 'bg-green',
            ].join(' ')}
          />
          {activeRole === 'coach' ? 'Coach' : 'Member'}
        </button>
      </div>
      <RoleSwitcherSheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}
