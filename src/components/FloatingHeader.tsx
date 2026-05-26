import { Avatar } from './Avatar';
import { useIsCompact } from './PhoneFrame';
import type { Profile } from '@/types';

interface FloatingHeaderProps {
  title: string;
  profile: Profile;
  onProfileTap: () => void;
}

export function FloatingHeader({ title, profile, onProfileTap }: FloatingHeaderProps) {
  const compact = useIsCompact();
  return (
    <div
      className="absolute inset-x-0 z-40 px-3 pt-2 pointer-events-none"
      style={{ top: compact ? 0 : 46 }}
    >
      <div className="pointer-events-auto flex items-center justify-between bg-white/85 backdrop-blur-lg rounded-[16px] px-4 py-2.5 shadow-[0_2px_12px_rgba(42,42,38,0.08)]">
        <span className="font-semibold text-[16px] text-ink">{title}</span>
        <button type="button" onClick={onProfileTap} aria-label="Profile">
          <Avatar profile={profile} size={28} />
        </button>
      </div>
    </div>
  );
}
