import { Avatar } from './Avatar';
import { useIsCompact } from './PhoneFrame';
import type { Profile } from '@/types';

interface FloatingHeaderProps {
  profile: Profile;
  onProfileTap: () => void;
  /** When true, shows a back arrow instead of the avatar (used on profile/settings). */
  showBack?: boolean;
}

export function FloatingHeader({ profile, onProfileTap, showBack }: FloatingHeaderProps) {
  const compact = useIsCompact();
  const top = (compact ? 0 : 46) + 10;

  if (showBack) {
    return (
      <button
        type="button"
        onClick={onProfileTap}
        aria-label="Back"
        className="absolute z-40 right-4 pointer-events-auto w-[32px] h-[32px] rounded-full bg-white/85 backdrop-blur-lg shadow-[0_1px_8px_rgba(42,42,38,0.10)] grid place-items-center transition active:scale-90"
        style={{ top }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onProfileTap}
      aria-label="Profile"
      className="absolute z-40 right-4 pointer-events-auto rounded-full p-[3px] bg-white/85 backdrop-blur-lg shadow-[0_1px_8px_rgba(42,42,38,0.10)] transition active:scale-90"
      style={{ top }}
    >
      <Avatar profile={profile} size={28} />
    </button>
  );
}
