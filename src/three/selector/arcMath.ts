/**
 * Arc geometry constants for the semi-circular selector.
 *
 * Matched to Home's `SelectorArc` SVG underlay:
 *   viewBox 440Ã—240, arc center (220, 240), amber ring radius 186px.
 * The SVG sits at `left: clamp(8px,4vw,60px); bottom: 0` inside the 460px
 * selector zone; our canvas covers the top 440px of that zone, so the arc
 * center lives 20px below the canvas bottom edge.
 *
 * World units are derived so 1 unit = 186/2.2 px exactly,
 * letting an orthographic camera with zoom = PX_PER_UNIT map world â†’ px 1:1.
 */

/** 7 flavor slots, full-circle carousel. */
export const SLOT_COUNT = 7;
export const SLOT_STEP = (Math.PI * 2) / SLOT_COUNT;

/** Arc radius in world units. */
export const ARC_RADIUS = 2.2;

/** Amber ring is 186px in the SVG â†’ exact px-per-world-unit factor. */
export const PX_PER_UNIT = 186 / ARC_RADIUS;

/**
 * Mini-can body proportions (world units, unscaled). The body is ~31%
 * taller than the original 2.6 so the wheel cans read as proper Pringles
 * cans instead of stubby tins; lid/bottom caps keep their thickness.
 */
export const CAN_BODY_HEIGHT = 3.4;
export const CAN_LID_HEIGHT = 0.12;
export const CAN_BOTTOM_HEIGHT = 0.09;
/** Total can height / 2 (body + lid + bottom). */
export const CAN_HALF_HEIGHT =
  (CAN_BODY_HEIGHT + CAN_LID_HEIGHT + CAN_BOTTOM_HEIGHT) / 2; // 1.805

/**
 * Can centers orbit exactly one can half-height outside the amber ring
 * centerline so the ACTIVE can's base is tangent to the r=186px circle
 *. Can total height â‰ˆ 3.61 units
 * (body 3.4 + lid 0.12 + bottom 0.09) â†’ half-height 1.805, times
 * CAN_BASE_SCALE 0.36 â‰ˆ 0.65 world units. Smaller end cans rest on the
 * band's outer edge (SVG amber stroke spans r 169â€“203px = 2.0â€“2.4 world).
 */
export const CAN_BASE_SCALE = 0.36;
export const CAN_ORBIT_RADIUS = ARC_RADIUS + CAN_HALF_HEIGHT * CAN_BASE_SCALE;

/**
 * Visual compression of slot angles so 5 cans fit on the visible semicircle
 * (reference shows 5 minis on the arc; raw 2Ï€/7 spacing would only show 3
 * above the canvas bottom edge). Physics stay in uncompressed angle space.
 */
export const ANGLE_COMPRESS = 0.72;

/** Emphasis falloff range: f = 1 âˆ’ smoothstep(|Î¸|, 0, EMPHASIS_RANGE). */
export const EMPHASIS_RANGE = SLOT_STEP * 1.5 * ANGLE_COMPRESS;

/**
 * Cans rotating past the arc ends (|Î¸_vis| â‰³ 100Â°) fade/scale out and wrap
 * behind the white center disc instead of floating over it.
 */
export const FADE_START = 1.75; // ~100Â°
export const FADE_END = 2.05; // ~117Â°

/** Wrap an angle to (âˆ’Ï€, Ï€]. */
export function wrapPi(a: number): number {
  let r = a % (Math.PI * 2);
  if (r > Math.PI) r -= Math.PI * 2;
  if (r <= -Math.PI) r += Math.PI * 2;
  return r;
}

