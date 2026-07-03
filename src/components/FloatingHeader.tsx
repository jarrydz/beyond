import { Avatar } from './Avatar';
import { useIsCompact } from './PhoneFrame';
import { SparkIcon } from './PointsSheet';
import type { Profile } from '@/types';

interface FloatingHeaderProps {
  profile: Profile;
  onProfileTap: () => void;
  /** When true, shows a back arrow instead of the avatar (used on profile/settings). */
  showBack?: boolean;
  /** Points wallet balance — the pill shows when provided (member side only). */
  points?: number;
  /** Tap on the wallet pill — opens the earn history. */
  onPointsTap?: () => void;
}

export function FloatingHeader({
  profile,
  onProfileTap,
  showBack,
  points,
  onPointsTap,
}: FloatingHeaderProps) {
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
    <div className="absolute z-40 right-4 flex items-center gap-2" style={{ top }}>
      {typeof points === 'number' && (
        <button
          type="button"
          onClick={onPointsTap}
          aria-label={`${points} points — view earn history`}
          className="pointer-events-auto h-[34px] rounded-full bg-white/85 backdrop-blur-lg shadow-[0_1px_8px_rgba(42,42,38,0.10)] px-3 flex items-center gap-1.5 transition active:scale-95"
        >
          <SparkIcon className="w-[13px] h-[13px] text-green" />
          <span className="text-[12.5px] font-semibold tabular-nums">{points}</span>
        </button>
      )}
      <button
        type="button"
        onClick={onProfileTap}
        aria-label="Profile"
        className="pointer-events-auto rounded-full p-[3px] bg-white/85 backdrop-blur-lg shadow-[0_1px_8px_rgba(42,42,38,0.10)] transition active:scale-90"
      >
        <Avatar profile={profile} size={28} />
      </button>
    </div>
  );
}
