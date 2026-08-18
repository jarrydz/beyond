import { useNavigate } from 'react-router-dom';
import { BottomSheet, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Demo-only member switcher (2026-08-18) — the RoleSwitcherSheet pattern
 * applied to the two demo personas. Andrew tells the guest story (booked,
 * arriving soon); Evelyn tells the subscriber story (alumna, no booking,
 * cold start). Switching to a no-booking member replays onboarding, so
 * /onboarding is finally demoable. Reset lives here too — it must be
 * reachable from BOTH personas, and the journey sheet needs a booking.
 */
export function MemberSwitcherSheet({ open, onClose }: Props) {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const currentUserId = useStoreState((s) => s.currentUserId);
  const personas = useStoreState((s) =>
    s.profiles
      .filter((p) => p.id === 'member-jarryd' || p.id === 'member-evelyn')
      .map((p) => ({
        id: p.id,
        name: p.fullName,
        subtitle:
          s.booking?.profileId === p.id
            ? 'Booked · arriving soon — the guest story'
            : 'Alumna · no booking — the cold start',
      })),
  );

  function switchTo(id: string, name: string) {
    if (id === currentUserId) {
      onClose();
      return;
    }
    data.demoSwitchMember(id);
    onClose();
    toast(`Now viewing as ${name.split(' ')[0]}`);
    navigate('/m', { replace: true });
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Member"
      subtitle="Demo control — two personas, two sales stories. Not a product feature."
    >
      {personas.map((p) => {
        const active = p.id === currentUserId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => switchTo(p.id, p.name)}
            className={[
              'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[13px] mb-[9px] bg-white transition-colors',
              active ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
            ].join(' ')}
          >
            <div>
              <div className="font-semibold text-[15px]">{p.name}</div>
              <div className="text-muted text-[12.5px]">{p.subtitle}</div>
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
          toast('Demo reset — Andrew, 7 days out, clean');
          navigate('/m', { replace: true });
        }}
        className="mt-2 w-full text-center text-[13.5px] text-muted py-3 font-semibold"
      >
        Reset demo
      </button>
    </BottomSheet>
  );
}
