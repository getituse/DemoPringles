import { useId } from 'react';

/**
 * Orange striped sunburst circle.
 * 18 wedges (20Â° each) alternating `--flavor-circle-a` / `--flavor-circle-b`,
 * bright upper-left sheen overlay, soft ivory rim, drop shadow.
 * Wedge fills are driven by the CSS vars, so the GSAP master timeline's
 * var tween recolors the circle automatically; WebGL/3D agents may also
 * tween the wedge `fill` attributes directly via the `data-wedge` hooks.
 *
 * Idle: 90s linear rotation + 6s float (CSS, disabled under reduced motion).
 */

const WEDGES = 18;
const R = 240;

function wedgePath(index: number): string {
  const a0 = (index * 360) / WEDGES;
  const a1 = ((index + 1) * 360) / WEDGES;
  const p = (deg: number): [number, number] => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [R + R * Math.cos(rad), R + R * Math.sin(rad)];
  };
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${R} ${R} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

export default function StripedCircle({
  className = '',
  size = 480,
}: {
  className?: string;
  size?: number;
}) {
  const gradientId = useId();

  return (
    <div
      className={`animate-wavy-float pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="animate-wavy-spin h-full w-full">
        <svg
          viewBox={`0 0 ${R * 2} ${R * 2}`}
          width={size}
          height={size}
          style={{
            filter: 'drop-shadow(0 24px 60px rgba(0,0,0,0.10))',
          }}
        >
          <defs>
            <radialGradient id={gradientId} cx="38%" cy="32%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <clipPath id={`${gradientId}-clip`}>
              <circle cx={R} cy={R} r={R - 1} />
            </clipPath>
          </defs>

          <g clipPath={`url(#${gradientId}-clip)`}>
            {Array.from({ length: WEDGES }, (_, i) => (
              <path
                key={i}
                d={wedgePath(i)}
                data-wedge={i % 2 === 0 ? 'a' : 'b'}
                fill={
                  i % 2 === 0
                    ? 'var(--flavor-circle-a)'
                    : 'var(--flavor-circle-b)'
                }
              />
            ))}
            <circle cx={R} cy={R} r={R - 1} fill={`url(#${gradientId})`} />
          </g>
          <circle
            cx={R}
            cy={R}
            r={R - 1}
            fill="none"
            stroke="rgba(247,242,231,0.9)"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
}

