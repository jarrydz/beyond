import type { PillarId } from '@/types';
import { getPillar } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';

/** Small inline pillar chip (icon + label) on the warm beige highlight fill. */
export function PillarBadge({
  pillarId,
  className = '',
}: {
  pillarId: PillarId;
  className?: string;
}) {
  const p = getPillar(pillarId);
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        'bg-grey-100 text-primary-700',
        className,
      ].join(' ')}
    >
      <span className="w-3.5 h-3.5 block [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8]">
        {pillarIcons[pillarId]}
      </span>
      {p.label}
    </span>
  );
}
