import { useCallback, useEffect, useRef } from 'react';
import { MathUtils } from 'three';
import {
  CAN_ORBIT_RADIUS,
  PX_PER_UNIT,
  SLOT_STEP,
  wrapPi,
} from './arcMath';

/**
 * Selector rotation physics â€” bicycle wheel.
 *
 * Continuous UNBOUNDED `rotation` + `velocity`; NO slot snapping, ever.
 * The wheel spins freely under drag / touch swipe / wheel, keeps its
 * release velocity as inertia, and coasts to a stop under a tiny
 * exponential friction. Can positions wrap modulo 2Ï€ in the carousel, so
 * cans cycle through the arc endlessly.
 *
 * The only attractor is `retarget`: when the `flavor` prop changes
 * externally (click selection, keyboard â†/â†’, deep link), the nearest
 * equivalent of the new flavor's slot angle becomes a critically-damped
 * spring target (~1s travel, shortest wrapped path) so the new active can
 * glides to arc center. ANY user input (pointerdown / wheel) cancels the
 * retarget instantly â€” the spring never fights dragging. After release
 * there is no re-attraction: the wheel just coasts.
 *
 * Inputs:
 *   - pointer drag / touch swipe: direct control + tracked release velocity
 *   - wheel / trackpad: velocity impulse (0.0015Â·delta, damped + clamped)
 *   - keyboard â†/â†’: handled by the outer listbox (calls onSelect â†’ the
 *     prop change retargets the damped rotation â€” one smooth slot step)
 * Reduced motion: drag/wheel rotate directly, release velocity is zeroed
 * (rotation without inertia); prop changes still glide via the damped
 * retarget, as before.
 */

export interface SelectorPhysicsState {
  /** Continuous arc rotation, radians (unbounded â€” wraps in the carousel). */
  rotation: number;
  /** Angular velocity, rad/s. */
  velocity: number;
  /**
   * Damped centering target for an externally-changed flavor (nearest
   * equivalent angle), or null when the wheel is free/coasting.
   */
  retarget: number | null;
  dragging: boolean;
}

export interface SelectorPhysics {
  state: React.RefObject<SelectorPhysicsState>;
  /** Advance the physics. Call once per frame with clamped dt. */
  update: (dt: number) => void;
}

/** Critically-damped retarget frequency â€” settles in ~1s. */
const RETARGET_OMEGA = 6;
const MAX_VELOCITY = 6; // rad/s
const WHEEL_IMPULSE = 0.0015; // per px of wheel delta
/**
 * Free-coast friction: velocity decays as vÂ·e^(âˆ’FRICTIONÂ·t). 1.2/s gives a
 * hard flick ~2/3 of a turn of travel before the wheel naturally stops.
 */
const COAST_FRICTION = 1.2;
/** Below this speed a coasting wheel is considered stopped. */
const STOP_EPSILON = 0.01;
/** Drag: arc-length / radius, evaluated at the can orbit in px. */
const DRAG_RADIANS_PER_PX = 1 / (CAN_ORBIT_RADIUS * PX_PER_UNIT);

export function useSelectorPhysics(
  element: HTMLElement | null,
  activeIndex: number,
  reducedMotion: boolean,
): SelectorPhysics {
  const state = useRef<SelectorPhysicsState>({
    rotation: -activeIndex * SLOT_STEP,
    velocity: 0,
    retarget: null,
    dragging: false,
  });
  const reducedRef = useRef(reducedMotion);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  // External flavor change â†’ retarget a smooth damped rotation to center
  // the new can (shortest wrapped path, ~1s travel). Never a hard snap.
  useEffect(() => {
    const s = state.current;
    const goal = -activeIndex * SLOT_STEP;
    s.retarget = s.rotation + wrapPi(goal - s.rotation);
  }, [activeIndex]);

  // Input: drag / touch swipe / wheel on the canvas element.
  useEffect(() => {
    if (!element) return;
    let lastX = 0;
    let lastT = 0;

    const onPointerDown = (e: PointerEvent) => {
      const s = state.current;
      s.dragging = true;
      s.velocity = 0;
      s.retarget = null; // user input always wins over centering
      lastX = e.clientX;
      lastT = performance.now();
      try {
        element.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released â€” safe to ignore */
      }
      element.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      const now = performance.now();
      const dt = Math.max((now - lastT) / 1000, 1 / 240);
      const dAngle = (e.clientX - lastX) * DRAG_RADIANS_PER_PX;
      s.rotation += dAngle;
      // EMA of instantaneous velocity â†’ smooth release inertia
      s.velocity = s.velocity * 0.7 + (dAngle / dt) * 0.3;
      lastX = e.clientX;
      lastT = now;
    };

    const endDrag = () => {
      const s = state.current;
      if (!s.dragging) return;
      s.dragging = false;
      // Release = pure inertia (clamped); NO re-attraction to any slot.
      s.velocity = MathUtils.clamp(s.velocity, -MAX_VELOCITY, MAX_VELOCITY);
      if (reducedRef.current) s.velocity = 0; // no inertia, reduced motion
      element.style.cursor = 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      s.retarget = null; // user input always wins over centering
      const impulse = MathUtils.clamp(
        (e.deltaY + e.deltaX) * WHEEL_IMPULSE,
        -0.6,
        0.6,
      );
      if (reducedRef.current) {
        s.rotation += impulse * 0.3; // direct rotation, no inertia
      } else {
        s.velocity = MathUtils.clamp(
          s.velocity + impulse,
          -MAX_VELOCITY,
          MAX_VELOCITY,
        );
      }
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', endDrag);
      element.removeEventListener('pointercancel', endDrag);
      element.removeEventListener('wheel', onWheel);
    };
  }, [element]);

  const update = useCallback((dt: number) => {
    const s = state.current;
    if (s.dragging) return;

    if (s.retarget != null) {
      // Smooth damped glide centering the externally-selected flavor.
      // Critically damped (Î¶ = 1): no overshoot, no oscillation.
      const accel =
        RETARGET_OMEGA * RETARGET_OMEGA * (s.retarget - s.rotation) -
        2 * RETARGET_OMEGA * s.velocity;
      s.velocity += accel * dt;
      s.rotation += s.velocity * dt;
      // Settled: release the target so the wheel is free again (jitter
      // guard deadzone â€” stop integrating sub-perceptible motion).
      if (
        Math.abs(s.velocity) < 0.002 &&
        Math.abs(s.retarget - s.rotation) < 0.001
      ) {
        s.rotation = s.retarget;
        s.velocity = 0;
        s.retarget = null;
      }
      return;
    }

    // Free bicycle-wheel coast: velocity + tiny exponential friction.
    if (s.velocity !== 0) {
      s.rotation += s.velocity * dt;
      s.velocity *= Math.exp(-COAST_FRICTION * dt);
      if (Math.abs(s.velocity) < STOP_EPSILON) s.velocity = 0;
    }
  }, []);

  return { state, update };
}

