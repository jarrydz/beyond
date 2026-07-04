import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

export function CoachProfileScreen() {
  const data = useData();
  const navigate = useNavigate();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);

  function signOut() {
    data.signOut();
    navigate('/welcome', { replace: true });
  }

  return (
    <section className="px-5 pt-3 pb-7">
      <div className="flex flex-col items-center pt-4 pb-6">
        <Avatar profile={me} size={72} />
        <h2 className="font-serif font-semibold text-[22px] mt-3">{me.fullName}</h2>
        <p className="text-muted text-[13px] mt-0.5">Coach</p>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="mt-4 w-full text-center text-[14px] text-muted py-3 font-semibold"
      >
        Sign out
      </button>
    </section>
  );
}
