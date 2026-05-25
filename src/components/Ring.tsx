import type { ReactNode } from 'react';

interface RingProps {
  value: number;
  max: number;
  size?: number;
  children?: ReactNode;
  track?: string;
  fill?: string;
}

/** Conic-gradient progress ring from the prototype. */
export function Ring({
  value,
  max,
  size = 62,
  children,
  track = '#EAE2D4',
  fill = '#3A5145',
}: RingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const inner = size - 14;
  return (
    <div
      className="grid place-items-center flex-none rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${fill} ${pct}%, ${track} 0)`,
      }}
    >
      <div
        className="grid place-items-center bg-white rounded-full font-semibold text-green"
        style={{
          width: inner,
          height: inner,
          fontSize: Math.max(11, Math.round(size * 0.22)),
        }}
      >
        {children ?? `${value}/${max}`}
      </div>
    </div>
  );
}
