import { useNavigate } from 'react-router-dom';
import { BottomSheet, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RoleSwitcherSheet({ open, onClose }: Props) {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const activeRole = useStoreState((s) => s.activeRole);

  function switchTo(role: 'member' | 'coach') {
    if (role === activeRole) {
      onClose();
      return;
    }
    data.switchRole(role);
    onClose();
    toast(role === 'coach' ? 'Switched to coach view' : 'Switched to member view');
    navigate(role === 'coach' ? '/c' : '/m', { replace: true });
  }

  function signOut() {
    data.signOut();
    onClose();
    navigate('/welcome', { replace: true });
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Switch view"
      subtitle="Demo only — flip between the member and coach app without signing out."
    >
      <Tile
        active={activeRole === 'member'}
        title="Member"
        subtitle="What a retreat alum sees"
        onClick={() => switchTo('member')}
      />
      <Tile
        active={activeRole === 'coach'}
        title="Coach"
        subtitle="What Lucy sees"
        onClick={() => switchTo('coach')}
      />
      <button
        type="button"
        onClick={signOut}
        className="mt-2 w-full text-center text-[13.5px] text-muted py-3 font-semibold"
      >
        Sign out
      </button>
    </BottomSheet>
  );
}

function Tile({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[13px] mb-[9px] bg-white transition-colors',
        active ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
      ].join(' ')}
    >
      <div>
        <div className="font-semibold text-[15px]">{title}</div>
        <div className="text-muted text-[12.5px]">{subtitle}</div>
      </div>
      {active && (
        <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
          Active
        </span>
      )}
    </button>
  );
}
