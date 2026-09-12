import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import {
  CanvasTexture,
  Color,
  CylinderGeometry,
  MathUtils,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import type { OrthographicCamera, PointLight } from 'three';
import type { FlavorId } from '@/data/flavors';
import { FLAVOR_LIST } from '@/data/flavors';
import { THEMES } from '@/theme/themes';
import {
  ANGLE_COMPRESS,
  ARC_RADIUS,
  CAN_BASE_SCALE,
  CAN_BODY_HEIGHT,
  CAN_BOTTOM_HEIGHT,
  CAN_LID_HEIGHT,
  CAN_ORBIT_RADIUS,
  EMPHASIS_RANGE,
  FADE_END,
  FADE_START,
  PX_PER_UNIT,
  SLOT_COUNT,
  SLOT_STEP,
  wrapPi,
} from './arcMath';
import { useSelectorPhysics } from './useSelectorPhysics';
import { useLabelTextures } from './useLabelTextures';
import { MiniCan } from './MiniCan';
import type { MiniCanHandle, SharedCanAssets } from './MiniCan';

/**
 * The 3D selector scene: 7 mini Pringles cans standing on a
 * semicircular arc matched 1:1 (orthographic, PX_PER_UNIT zoom) to Home's
 * SVG arc underlay. One useFrame drives:
 *   - spring physics (drag / wheel / external flavor changes)
 *   - per-can emphasis interpolation by signed angular distance from arc
 *     center: scale, z-depth, opacity, brightness, tilt, yaw, idle spin â€”
 *     all damped per frame, never snapping
 *   - a flavor-tinted rim light that follows the highlighted candidate
 */

/** Soft elliptical blob-shadow texture (fake contact shadow). */
function makeShadowTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 32, 2, 64, 32, 62);
  g.addColorStop(0, 'rgba(0,0,0,0.8)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.32)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 64);
  return new CanvasTexture(c);
}

/**
 * Keeps the orthographic camera anchored to Home's SVG arc underlay at ANY
 * container size. The world origin (arc center) and the worldâ†’pixel scale
 * are derived from the *rendered* SVG element itself (measured via
 * getBoundingClientRect against the canvas box, tracked with a
 * ResizeObserver), so the registration holds whether Home renders the
 * underlay at its native 440Ã—240 or scaled down on small screens.
 *
 * Two defensive invariants live here:
 *  - rotation forced to identity: R3F applies `camera.lookAt(0,0,0)` to a
 *    default camera created without an explicit `rotation` prop (fiber
 *    createCamera), which would pitch the view and fling the cans above
 *    the arc apex / out of view on short viewports;
 *  - zoom + updateProjectionMatrix applied manually after every measure.
 */
function CameraSync() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const el = gl.domElement;
    // The underlay SVG is a sibling of our wrapper inside Home's selector
    // zone (Home lays canvas and SVG in the same box).
    const findUnderlay = (): SVGSVGElement | null =>
      el.closest('[data-scene="selector"]')?.parentElement?.querySelector('svg') ??
      null;

    const update = () => {
      const cam = camera as OrthographicCamera;
      const canvasRect = el.getBoundingClientRect();
      const svg = findUnderlay();

      let arcCenterPxX: number;
      let arcCenterPxY: number;
      let pxPerUnit: number;
      const svgRect = svg?.getBoundingClientRect();
      if (svg && svgRect && svgRect.width > 0) {
        // SVG viewBox 440Ã—240, arc center (220,240), amber ring r=186.
        const k = svgRect.width / 440;
        arcCenterPxX = svgRect.left - canvasRect.left + 220 * k;
        arcCenterPxY = svgRect.top - canvasRect.top + 240 * k;
        pxPerUnit = (186 * k) / ARC_RADIUS;
      } else {
        // Fallback: native 440Ã—240 underlay at left clamp(8px,4vw,60px),
        // bottom-aligned to a 460px zone (canvas covers the top 440px).
        const gutter = MathUtils.clamp(window.innerWidth * 0.04, 8, 60);
        arcCenterPxX = gutter + 220;
        arcCenterPxY = size.height + 20;
        pxPerUnit = PX_PER_UNIT;
      }

      cam.zoom = pxPerUnit;
      cam.position.set(
        (size.width / 2 - arcCenterPxX) / pxPerUnit,
        (arcCenterPxY - size.height / 2) / pxPerUnit,
        10,
      );
      cam.rotation.set(0, 0, 0);
      cam.updateProjectionMatrix();
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const svg = findUnderlay();
    if (svg) ro.observe(svg);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [camera, gl, size]);
  return null;
}

export default function SelectorCarousel({
  flavor,
  onSelect,
  activeIndex,
  reducedMotion,
}: {
  flavor: FlavorId;
  onSelect: (f: FlavorId) => void;
  activeIndex: number;
  reducedMotion: boolean;
}) {
  const gl = useThree((s) => s.gl);
  const physics = useSelectorPhysics(gl.domElement, activeIndex, reducedMotion);
  const textures = useLabelTextures();

  // Shared geometry + lid/bottom materials (â‰¤3k tris for all 7 cans).
  const assets = useMemo<SharedCanAssets>(
    () => ({
      body: new CylinderGeometry(0.72, 0.72, CAN_BODY_HEIGHT, 40, 1, true),
      lid: new CylinderGeometry(0.745, 0.745, CAN_LID_HEIGHT, 40),
      bottom: new CylinderGeometry(0.735, 0.7, CAN_BOTTOM_HEIGHT, 40),
      shadowPlane: new PlaneGeometry(3.4, 1.4),
      lidMaterial: new MeshStandardMaterial({
        color: '#C9A227',
        metalness: 0.9,
        roughness: 0.28,
      }),
      bottomMaterial: new MeshStandardMaterial({
        color: '#D8D8D8',
        metalness: 0.85,
        roughness: 0.35,
      }),
      shadowTexture: makeShadowTexture(),
    }),
    [],
  );
  useEffect(
    () => () => {
      assets.body.dispose();
      assets.lid.dispose();
      assets.bottom.dispose();
      assets.shadowPlane.dispose();
      assets.lidMaterial.dispose();
      assets.bottomMaterial.dispose();
      assets.shadowTexture.dispose();
    },
    [assets],
  );

  const handles = useRef<Array<MiniCanHandle | null>>(
    Array(SLOT_COUNT).fill(null),
  );
  const register = useCallback((index: number, h: MiniCanHandle | null) => {
    handles.current[index] = h;
  }, []);

  const rimRef = useRef<PointLight>(null);
  const flavorRef = useRef(flavor);
  useEffect(() => {
    flavorRef.current = flavor;
  }, [flavor]);
  const reducedRef = useRef(reducedMotion);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);
  const tmpColor = useMemo(() => new Color(), []);

  // Canvas element hygiene: touch drag = rotate (not page scroll),
  // grab/grabbing cursor, hidden from AT (the listbox wrapper owns a11y).
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    el.setAttribute('aria-hidden', 'true');
  }, [gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    physics.update(dt);
    const { rotation } = physics.state.current;

    let nearest = 0;
    let nearestD = Infinity;

    for (let i = 0; i < SLOT_COUNT; i++) {
      const h = handles.current[i];
      if (!h) continue;
      // Signed angular distance from arc center (compressed visual space).
      const theta = wrapPi(i * SLOT_STEP + rotation) * ANGLE_COMPRESS;
      const d = Math.abs(theta);
      if (d < nearestD) {
        nearestD = d;
        nearest = i;
      }

      // Emphasis (center = 1) + end-of-arc visibility fade (wrap behind).
      const f = 1 - MathUtils.smoothstep(d, 0, EMPHASIS_RANGE);
      const vis = 1 - MathUtils.smoothstep(d, FADE_START, FADE_END);

      const scaleT =
        CAN_BASE_SCALE * (0.55 + 0.45 * f) * (0.55 + 0.45 * vis);
      const zT = f * 0.5 - (1 - f) * 0.35 - (1 - vis) * 0.4;
      const opacityT = (0.35 + 0.65 * f) * vis;
      const brightnessT = 0.6 + 0.4 * f;
      const spinT = reducedRef.current ? 0 : 0.25 + 0.65 * f;

      // Per-frame damped interpolation â€” continuous, never snapping.
      const st = h.state;
      st.scale = MathUtils.damp(st.scale, scaleT, 9, dt);
      st.z = MathUtils.damp(st.z, zT, 9, dt);
      st.opacity = MathUtils.damp(st.opacity, opacityT, 9, dt);
      st.brightness = MathUtils.damp(st.brightness, brightnessT, 9, dt);
      st.spin = MathUtils.damp(st.spin, spinT, 6, dt);

      // Position / tilt / yaw are pure functions of the continuous arc
      // angle (radial "standing on the ring" tilt, upright at center).
      h.outer.position.set(
        Math.sin(theta) * CAN_ORBIT_RADIUS,
        Math.cos(theta) * CAN_ORBIT_RADIUS,
        st.z,
      );
      h.outer.rotation.set(0, theta * 0.3, -theta * 0.85);
      h.outer.scale.setScalar(Math.max(st.scale, 0.0001));
      h.outer.visible = st.opacity > 0.01;

      // Gentle idle spin about the can's own Y; the active can spins faster.
      h.spin.rotation.y += st.spin * dt;

      // Material: brightness/dim + opacity + flavor-tinted glow for the
      // active can. While its texture loads, a can shows its theme color.
      const m = h.label;
      m.opacity = st.opacity;
      if (m.map) {
        m.color.setScalar(st.brightness);
      } else {
        m.color
          .set(THEMES[FLAVOR_LIST[i].id].main)
          .multiplyScalar(st.brightness);
      }
      m.emissiveIntensity = f * 0.22;

      h.shadow.opacity = 0.22 * (0.35 + 0.65 * f) * vis;
    }

    // Flavor-tinted rim light hugging the highlighted candidate can.
    const hn = handles.current[nearest];
    const rim = rimRef.current;
    if (rim && hn) {
      rim.position.x = MathUtils.damp(
        rim.position.x,
        hn.outer.position.x - 0.7,
        6,
        dt,
      );
      rim.position.y = MathUtils.damp(
        rim.position.y,
        hn.outer.position.y + 0.9,
        6,
        dt,
      );
      rim.position.z = MathUtils.damp(
        rim.position.z,
        hn.outer.position.z + 1.6,
        6,
        dt,
      );
      tmpColor.set(THEMES[flavorRef.current].main);
      rim.color.lerp(tmpColor, 1 - Math.exp(-6 * dt));
      const fN = 1 - MathUtils.smoothstep(nearestD, 0, EMPHASIS_RANGE);
      rim.intensity = MathUtils.damp(rim.intensity, 2.2 * fN, 6, dt);
    }
  });

  return (
    <>
      <CameraSync />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <pointLight
        ref={rimRef}
        position={[0, 3, 2]}
        intensity={0}
        distance={6}
        decay={2}
      />
      {/* Isolated boundary: a slow/unreachable preset CDN must never
          block the cans themselves from rendering. */}
      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>
      {FLAVOR_LIST.map((f, i) => (
        <MiniCan
          key={f.id}
          flavor={f}
          index={i}
          texture={textures[f.id]}
          assets={assets}
          register={register}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

