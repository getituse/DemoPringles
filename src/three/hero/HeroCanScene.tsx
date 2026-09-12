import { Suspense, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { FLAVORS } from '@/data/flavors';
import type { FlavorId } from '@/data/flavors';
import { THEMES } from '@/theme/themes';
import PringlesCan from './PringlesCan';
import FloatingChips from './FloatingChips';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * HERO 3D SCENE â€” transparent canvas hosting the
 * interactive Pringles can + floating 3D chips.
 *
 *  - `<PringlesCan>`: labeled cylinder body, gold lid, aluminum bottom,
 *    drag-to-spin inertia, pointer parallax, hover lift, GSAP flavor swaps
 *  - `<FloatingChips>`: shared-geometry InstancedMesh wavy crisps with
 *    per-instance bob/drift and hover scatter springs
 *  - Studio look: drei Environment "studio" preset, key/warm-fill/tinted-rim
 *    light rig (rim tint tweens with the flavor theme), ContactShadows,
 *    ACES tone mapping (R3F default) for the product-render feel
 *
 * A11y contract: outer element keeps `role="img"` + an aria-label
 * describing the current flavor can.
 */

export interface HeroInteraction {
  /** pointer normalized to the mount rect, x/y âˆˆ [-1, 1] */
  pointer: { x: number; y: number };
  /** pointer is over the hero visual */
  inside: boolean;
  dragging: boolean;
  /** accumulated horizontal drag delta (px) â€” consumed by the can each frame */
  dragDX: number;
  /** performance.now()/1000 of last pointer activity (idle detection) */
  lastActive: number;
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0.1, 0);
  }, [camera]);
  return null;
}

function LightingRig({
  flavor,
  interaction,
}: {
  flavor: FlavorId;
  interaction: RefObject<HeroInteraction>;
}) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.SpotLight>(null);
  const envCur = useRef(1);
  const dip = useRef({ v: 1 });
  const first = useRef(true);

  // flavor switch: rim tint tweens to --flavor-main, env intensity dips
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const rim = rimRef.current;
    if (rim) {
      const c = new THREE.Color(THEMES[flavor].main);
      gsap.to(rim.color, {
        r: c.r,
        g: c.g,
        b: c.b,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    }
    const d = dip.current;
    gsap.killTweensOf(d);
    const tl = gsap
      .timeline()
      .to(d, { v: 0.7, duration: 0.5, ease: 'power2.inOut' })
      .to(d, { v: 1.15, duration: 0.7, ease: 'power2.inOut' });
    return () => {
      tl.kill();
    };
  }, [flavor]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const hover = interaction.current.inside;
    const key = keyRef.current;
    if (key) {
      key.intensity = THREE.MathUtils.damp(
        key.intensity,
        hover ? 2.8 : 2.2,
        6,
        dt,
      );
    }
    envCur.current = THREE.MathUtils.damp(
      envCur.current,
      hover ? 1.25 : 1,
      6,
      dt,
    );
    state.scene.environmentIntensity = envCur.current * dip.current.v;
  });

  // point/spot intensities are in physical units (three â‰¥ r155):
  // â‰ˆ desired illuminance Ã— distanceÂ² to the can
  return (
    <>
      <directionalLight ref={keyRef} position={[4, 6, 4]} intensity={2.2} />
      <pointLight position={[-4, 1, 3]} intensity={9} color="#FFC61A" />
      <spotLight
        ref={rimRef}
        position={[0, 3, -5]}
        intensity={22}
        color={THEMES[flavor].main}
        angle={0.8}
        penumbra={1}
      />
    </>
  );
}

export default function HeroCanScene({
  flavor,
  className = '',
}: {
  flavor: FlavorId;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const interaction = useRef<HeroInteraction>({
    pointer: { x: 0, y: 0 },
    inside: false,
    dragging: false,
    dragDX: 0,
    lastActive: 0,
  });
  const lastClientX = useRef(0);

  const updatePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    interaction.current.pointer.x =
      ((e.clientX - rect.left) / rect.width) * 2 - 1;
    interaction.current.pointer.y = -(
      ((e.clientY - rect.top) / rect.height) * 2 -
      1
    );
  };

  return (
    <div
      className={className}
      role="img"
      aria-label={`Interactive 3D Pringles Wavy ${FLAVORS[flavor].name} can â€” drag to spin`}
      data-scene="hero-can"
      data-flavor={flavor}
      style={{ touchAction: 'pan-y', userSelect: 'none' }}
      onPointerEnter={(e) => {
        interaction.current.inside = true;
        updatePointer(e);
      }}
      onPointerLeave={() => {
        interaction.current.inside = false;
        interaction.current.pointer.x = 0;
        interaction.current.pointer.y = 0;
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        interaction.current.dragging = true;
        interaction.current.lastActive = performance.now() / 1000;
        lastClientX.current = e.clientX;
        updatePointer(e);
      }}
      onPointerMove={(e) => {
        updatePointer(e);
        interaction.current.lastActive = performance.now() / 1000;
        if (interaction.current.dragging) {
          interaction.current.dragDX += e.clientX - lastClientX.current;
          lastClientX.current = e.clientX;
        }
      }}
      onPointerUp={(e) => {
        interaction.current.dragging = false;
        interaction.current.lastActive = performance.now() / 1000;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        interaction.current.dragging = false;
      }}
    >
      <Canvas
        dpr={[1, 1.75]}
        frameloop="always"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 30, position: [0, 0.4, 7.2], near: 0.1, far: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // page ivory shows through
        }}
      >
        <CameraRig />
        <LightingRig flavor={flavor} interaction={interaction} />
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>
        <Suspense fallback={null}>
          <PringlesCan
            flavor={flavor}
            interaction={interaction}
            reduced={reduced}
          />
        </Suspense>
        <Suspense fallback={null}>
          <FloatingChips
            flavor={flavor}
            interaction={interaction}
            reduced={reduced}
          />
        </Suspense>
        <ContactShadows
          position={[0, -1.44, 0]}
          opacity={0.38}
          scale={6}
          blur={2.6}
          far={2}
          color="#3a2a12"
        />
      </Canvas>
    </div>
  );
}

