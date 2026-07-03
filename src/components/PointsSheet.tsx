import type { PointsLedgerEntry } from '@/types';
import { relativeTime } from '@/utils/format';
import { BottomSheet } from './BottomSheet';

interface Props {
  open: boolean;
  onClose: () => void;
  balance: number;
  /** Newest first. */
  ledger: PointsLedgerEntry[];
}

/**
 * The earn history — total transparency: every entry shows what it was for,
 * how much, and when. Calm, not casino; no mystery mechanics.
 */
export function PointsSheet({ open, onClose, balance, ledger }: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Your points"
      subtitle="Earned for real wellbeing actions — every point explained."
    >
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-serif font-semibold text-[34px] leading-none">{balance}</span>
        <span className="text-muted text-[13px]">points</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar -mx-1 px-1">
        {ledger.length > 0 ? (
          ledger.map((e, i) => (
            <div
              key={e.id}
              className={[
                'flex items-center justify-between gap-3 py-2.5',
                i === ledger.length - 1 ? '' : 'border-b border-line',
              ].join(' ')}
            >
              <div className="min-w-0">
                <div className="font-semibold text-[13.5px]">{e.label}</div>
                <div className="text-muted text-[12px]">{relativeTime(e.at)}</div>
              </div>
              <span
                className={[
                  'flex-none font-serif font-semibold text-[15px]',
                  e.points >= 0 ? 'text-green' : 'text-terra-deep',
                ].join(' ')}
              >
                {e.points >= 0 ? `+${e.points}` : e.points}
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted text-[13.5px] py-2">
            Nothing yet — check in, complete a session or save a recipe to start earning.
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

/** Small four-point spark — the wallet glyph. Quieter than a coin. */
export function SparkIcon({ className = 'w-[14px] h-[14px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8z" />
    </svg>
  );
}
