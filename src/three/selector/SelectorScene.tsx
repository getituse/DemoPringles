import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { FlavorId } from '@/data/flavors';
import { FLAVOR_LIST } from '@/data/flavors';
import SelectorCarousel from './SelectorCarousel';
import { PX_PER_UNIT } from './arcMath';
import { useReducedMotion } from './useReducedMotion';
import { isKeyboardModality } from '@/lib/inputModality';

/**
 * Semi-circular 3D flavor selector.
 *
 * Transparent orthographic `<Canvas>` mounted on top of Home's SVG arc
 * underlay, hosting 7 miniature Three.js Pringles cans on the arc with
 * spring physics (`useSelectorPhysics`: drag / touch / wheel, velocity +
 * damping + critically-damped settle, no slot snapping), per-frame emphasis
 * interpolation, raycast click â†’ `onSelect(id)`, and a flavor-tinted rim
 * light on the active can.
 *
 * Accessibility contract (unchanged from scaffold): the wrapper is the
 * `role="listbox"` with â†/â†’/Enter keyboard operation and visually-hidden
 * `role="option"` buttons; the canvas itself is aria-hidden.
 */
export default function SelectorScene({
  flavor,
  onSelect,
  className = '',
}: {
  flavor: FlavorId;
  onSelect: (f: FlavorId) => void;
  className?: string;
}) {
  const activeIndex = FLAVOR_LIST.findIndex((f) => f.id === flavor);
  const reducedMotion = useReducedMotion();

  const step = (dir: 1 | -1) => {
    const next =
      (activeIndex + dir + FLAVOR_LIST.length) % FLAVOR_LIST.length;
    onSelect(FLAVOR_LIST[next].id);
  };

  return (
    <div
      className={className}
      role="listbox"
      aria-label="Choose your Pringles flavor"
      aria-activedescendant={`selector-option-${flavor}`}
      tabIndex={0}
      onFocus={(e) => {
        // The ring paints ONLY for keyboard-originated focus. UA
        // :focus-visible heuristics are untrustworthy here (Safari matches
        // them for scripted focus after a mouse click), so the manual
        // [data-kb-focus] ring is driven by what-input modality tracking.
        if (isKeyboardModality())
          e.currentTarget.setAttribute('data-kb-focus', '');
      }}
      onKeyDown={(e) => {
        // Keyboard interaction â†’ keyboard-originated focus; show the ring.
        e.currentTarget.setAttribute('data-kb-focus', '');
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          step(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          step(1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(flavor);
        }
      }}
      onPointerDown={(e) => {
        // Clicking the canvas arms keyboard operation, but a
        // pointer-originated focus must NEVER paint the focus ring.
        e.currentTarget.removeAttribute('data-kb-focus');
        e.currentTarget.focus({ preventScroll: true });
      }}
      onBlur={(e) => {
        e.currentTarget.removeAttribute('data-kb-focus');
      }}
      data-scene="selector"
      data-flavor={flavor}
    >
      <Canvas
        orthographic
        dpr={[1, 1.75]}
        frameloop="always"
        gl={{ antialias: true, alpha: true }}
        camera={{
          position: [0.24, 2.84, 10],
          // Explicit identity rotation is REQUIRED: R3F otherwise applies
          // lookAt(0,0,0) to a default camera, pitching the view and
          // flinging the cans off the arc (CameraSync re-enforces this).
          rotation: [0, 0, 0],
          zoom: PX_PER_UNIT,
          near: 0.1,
          far: 40,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SelectorCarousel
            flavor={flavor}
            onSelect={onSelect}
            activeIndex={activeIndex < 0 ? 0 : activeIndex}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>

      {/* Visually-hidden flavor options */}
      <div className="sr-only">
        {FLAVOR_LIST.map((f) => (
          <button
            key={f.id}
            id={`selector-option-${f.id}`}
            role="option"
            aria-selected={f.id === flavor}
            tabIndex={-1}
            onClick={() => onSelect(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  );
}

