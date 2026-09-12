import { useThree } from '@react-three/fiber';

/**
 * Shared hero-stage scale. The can + chips live in "design units"
 * (can body radius 0.55, height 3.0) and are uniformly scaled so the
 * composition reads correctly inside the ~520×640 mount at any breakpoint.
 */
export const CAN_SCALE = 0.82;

/** Scale factor relative to the reference mount aspect (520/640 = 0.8125). */
export function useStageScale(): number {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(size.height, 1);
  return CAN_SCALE * Math.min(1, aspect / 0.8);
}
