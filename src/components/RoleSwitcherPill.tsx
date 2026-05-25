import { useState } from 'react';
import { RoleSwitcherSheet } from './RoleSwitcherSheet';
import { useStoreState } from '@/store/StoreProvider';

/** Small floating pill in the top-right corner of the phone, above the screen content.
 *  Lets you flip between member/coach during the demo without re-entering the PIN. */
export function RoleSwitcherPill() {
  const [open, setOpen] = useState(false);
  const activeRole = useStoreState((s) => s.activeRole);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Switch role"
        className="absolute top-[54px] right-4 z-40 flex items-center gap-1.5 text-[10.5px] tracking-[0.13em] uppercase font-semibold text-green-soft px-2.5 py-1 rounded-full border border-line bg-white/90 backdrop-blur hover:border-sage transition-colors"
      >
        <span
          className={[
            'w-1.5 h-1.5 rounded-full',
            activeRole === 'coach' ? 'bg-terra' : 'bg-green',
          ].join(' ')}
        />
        {activeRole === 'coach' ? 'Coach' : 'Member'}
      </button>
      <RoleSwitcherSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
