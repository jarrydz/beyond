import type { CSSProperties } from 'react';
import type { Profile } from '@/types';

interface AvatarProps {
  profile: Profile;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

// Palette from beyond-prototype.html (a1..a4) for non-self, non-leader members.
// Water-toned avatars (design refresh) — serif initials on deep teals.
const PALETTE = ['#22484F', '#3D6A72', '#2C5259', '#173238'];
const LEADER = '#2C5259';

export function avatarColor(profile: Profile): string {
  if (profile.role === 'coach') return LEADER;
  if (profile.id === 'member-jarryd') return LEADER; // "self" matches the prototype's J avatar
  let h = 0;
  for (const ch of profile.id) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function Avatar({ profile, size = 42, className = '', style }: AvatarProps) {
  return (
    <div
      className={[
        'rounded-full flex-none grid place-items-center text-white font-serif font-semibold',
        className,
      ].join(' ')}
      style={{
        width: size,
        height: size,
        background: avatarColor(profile),
        fontSize: Math.max(12, size * 0.36),
        ...style,
      }}
      aria-label={profile.fullName}
    >
      {profile.avatarInitial}
    </div>
  );
}
