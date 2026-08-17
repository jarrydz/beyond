import { BottomSheet, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { offsetForDate } from '@/utils/journey';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Demo-only stage switcher (PRD-05) — the RoleSwitcherSheet pattern applied
 * to the simulated clock. Each row sets demoDayOffset to a canonical day and
 * the entire app (countdown copy, unlocked tasks, home screen, nav
 * visibility) recomputes from that one number. Not a product feature.
 */
export function JourneyStageSheet({ open, onClose }: Props) {
  const data = useData();
  const toast = useToast();
  const booking = useStoreState((s) =>
    s.booking && s.booking.profileId === s.currentUserId ? s.booking : null,
  );
  const currentOffset = useStoreState((s) => s.demoDayOffset);

  if (!booking) return null;

  const rows = [
    { label: '21 days out', meta: 'Journey — the first tasks unlock', offset: offsetForDate(booking.arrivalDate, -21) },
    { label: '7 days out', meta: 'Journey — taper live, mid-progress', offset: offsetForDate(booking.arrivalDate, -7) },
    { label: 'Day before', meta: 'Journey — "You\'re ready"', offset: offsetForDate(booking.arrivalDate, -1) },
    { label: 'On retreat', meta: 'Quiet mode', offset: offsetForDate(booking.arrivalDate, 1) },
    { label: 'Just home', meta: 'Reintegration', offset: offsetForDate(booking.departureDate, 3) },
    { label: 'Member', meta: "Today's home screen", offset: offsetForDate(booking.departureDate, 30) },
  ];

  function pick(offset: number) {
    data.setDemoDayOffset(offset);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Journey stage"
      subtitle="Demo control — moves the app's simulated clock. Not a product feature."
    >
      {rows.map((r) => {
        const active = r.offset === currentOffset;
        return (
          <button
            key={r.label}
            type="button"
            onClick={() => pick(r.offset)}
            className={[
              'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[11px] mb-[9px] bg-white transition-colors',
              active ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
            ].join(' ')}
          >
            <div>
              <div className="font-semibold text-[14.5px]">{r.label}</div>
              <div className="text-muted text-[12px]">{r.meta}</div>
            </div>
            {active && (
              <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
                Active
              </span>
            )}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => {
          data.resetJourneyDemo();
          onClose();
          toast('Demo reset — a clean run from 7 days out');
        }}
        className="mt-2 w-full text-center text-[13.5px] text-muted py-3 font-semibold"
      >
        Reset demo
      </button>
    </BottomSheet>
  );
}
