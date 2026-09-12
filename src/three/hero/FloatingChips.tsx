import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type { FlavorId } from '@/data/flavors';
import { THEMES } from '@/theme/themes';
import { createChipGeometry } from './chipGeometry';
import { useStageScale } from './stage';
import type { HeroInteraction } from './HeroCanScene';
import { assetUrl } from '@/lib/asset';

/**
 * Floating 3D chips around the hero can â€” REAL geometry,
 * never sprites. One shared wavy-crisp geometry rendered through a single
 * InstancedMesh; per-instance matrices are composed on the CPU each frame
 * (bob + tumble + drift + hover-scatter spring).
 *
 *  - idle: independent slow bobbing (0.5â€“0.9 Hz, Â±0.06), tiny rotation
 *    drift, micro-position drift, random phase per chip
 *  - can hover: chips scatter outward (base Ã— 1.35) with extra spin via a
 *    damped spring (stiffness 120 / damping 14 â†’ natural overshoot), and
 *    spring back on un-hover
 *  - flavor switch: staggered scale-out (0.35s) then back.out scale-in,
 *    matching the master timeline; seasoning tint lerps toward the flavor
 */

const COUNT_DESKTOP = 11;
const COUNT_MOBILE = 6; // responsive perf scaling
const CHIP_TEXTURE_URL = assetUrl('/chip-crisps.png');

/** [x, y, z, scale] â€” arc above/around the can in design units. */
const LAYOUT: ReadonlyArray<readonly [number, number, number, number]> = [
  [-0.5, 2.15, 0.1, 0.55], // above lid, left
  [0.25, 2.45, -0.2, 0.62], // above lid, center
  [0.75, 2.05, 0.2, 0.5], // above lid, right
  [1.15, 0.9, 0.25, 0.58], // mid-right on the circle
  [-1.2, 0.4, 0.15, 0.6], // left, near potato slices
  [-1.05, -0.55, -0.1, 0.5], // left lower
  [0.95, -0.9, 0.2, 0.55], // right lower
  [-0.55, -1.65, 0.3, 0.48], // bottom-left near band edge
  [0.5, -1.8, 0.15, 0.52], // bottom-right near band edge
  [1.35, -0.1, -0.15, 0.4], // far right
  [0.1, 1.8, 0.35, 0.28], // small crumb
];

interface ChipSeed {
  pos: THREE.Vector3;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  phase: number;
  phase2: number;
  bobFreq: number; // Hz
  driftFreq: number;
  rotSpeed: number; // rad/s slow tumble drift
  spinAcc: number; // accumulated rotation (mutated per frame)
}

interface Spring {
  s: number;
  v: number;
}

function makeSeeds(): ChipSeed[] {
  return LAYOUT.map(([x, y, z, scale]) => ({
    pos: new THREE.Vector3(x, y, z),
    scale,
    rotX: (Math.random() - 0.5) * 1.4,
    rotY: Math.random() * Math.PI * 2,
    rotZ: (Math.random() - 0.5) * 0.9,
    phase: Math.random() * Math.PI * 2,
    phase2: Math.random() * Math.PI * 2,
    bobFreq: 0.5 + Math.random() * 0.4,
    driftFreq: 0.3 + Math.random() * 0.4,
    rotSpeed: (Math.random() - 0.5) * 0.5,
    spinAcc: 0,
  }));
}

export default function FloatingChips({
  flavor,
  interaction,
  reduced,
}: {
  flavor: FlavorId;
  interaction: RefObject<HeroInteraction>;
  reduced: boolean;
}) {
  const texture = useTexture(CHIP_TEXTURE_URL);
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const geometry = useMemo(() => createChipGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFE7BB'), // warm multiplier over the photo
        roughness: 0.55,
        metalness: 0,
        sheen: 0.6, // subsurface illusion
        sheenColor: new THREE.Color('#FFE9A8'),
        clearcoat: 0.15,
        envMapIntensity: 0.8,
      }),
    [],
  );
  useEffect(() => {
    material.map = texture;
    material.needsUpdate = true;
  }, [material, texture]);

  const seeds = useMemo(() => makeSeeds(), []);
  const springs = useMemo<Spring[]>(
    () => seeds.map(() => ({ s: 0, v: 0 })),
    [seeds],
  );
  const pops = useMemo(() => seeds.map(() => ({ v: 0 })), [seeds]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches
        ? COUNT_MOBILE
        : COUNT_DESKTOP,
    [],
  );

  const stageScale = useStageScale();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const firstFlavor = useRef(true);

  // instance buffer setup + responsive count
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = count;
  }, [count]);

  // load: staggered pop-in
  useEffect(() => {
    if (reducedRef.current) {
      pops.forEach((p) => {
        p.v = 1;
      });
      return;
    }
    const tw = gsap.to(pops, {
      v: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
      stagger: 0.06,
      delay: 1.1,
    });
    return () => {
      tw.kill();
    };
  }, [pops]);

  // flavor switch: staggered scatter-out â†’ scale-in + seasoning tint
  useEffect(() => {
    if (firstFlavor.current) {
      firstFlavor.current = false;
      return;
    }
    const tint = new THREE.Color('#FFE7BB').lerp(
      new THREE.Color(THEMES[flavor].main),
      0.1,
    );
    gsap.to(material.color, {
      r: tint.r,
      g: tint.g,
      b: tint.b,
      duration: 1.2,
      ease: 'power2.inOut',
    });
    if (reducedRef.current) return; // fade-only switch: no spatial chip motion
    const tl = gsap.timeline();
    tl.to(
      pops,
      { v: 0, duration: 0.35, ease: 'power2.in', stagger: 0.03 },
      0,
    ).to(
      pops,
      { v: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.04 },
      0.5,
    );
    return () => {
      tl.kill();
    };
  }, [flavor, pops, material]);

  // unmount cleanup
  useEffect(
    () => () => {
      pops.forEach((p) => gsap.killTweensOf(p));
      gsap.killTweensOf(material.color);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      useTexture.clear(CHIP_TEXTURE_URL);
    },
    [geometry, material, texture, pops],
  );

  useFrame((state, rawDt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 30);
    const frozen = reducedRef.current;
    const t = frozen ? 0 : state.clock.elapsedTime;
    const scatterTarget = interaction.current.inside ? 1 : 0;

    for (let i = 0; i < count; i++) {
      const c = seeds[i];
      const sp = springs[i];

      // damped spring toward scatter target (stiffness 120, damping 14)
      const accel = 120 * (scatterTarget - sp.s) - 14 * sp.v;
      sp.v += accel * dt;
      sp.s += sp.v * dt;
      const spread = 1 + 0.35 * sp.s;

      if (!frozen) c.spinAcc += dt * (c.rotSpeed + sp.s * 6); // extra spin while scattered

      dummy.position.set(
        c.pos.x * spread + Math.sin(t * c.driftFreq + c.phase2) * 0.04,
        c.pos.y * spread +
          Math.sin(t * c.bobFreq * Math.PI * 2 + c.phase) * 0.06,
        c.pos.z * spread + Math.cos(t * c.driftFreq * 0.8 + c.phase) * 0.04,
      );
      dummy.rotation.set(
        c.rotX + Math.sin(t * 0.7 + c.phase) * 0.15,
        c.rotY + c.spinAcc,
        c.rotZ + Math.sin(t * 0.5 + c.phase2) * 0.15,
      );
      dummy.scale.setScalar(Math.max(c.scale * pops[i].v, 1e-4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group scale={stageScale}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, COUNT_DESKTOP]}
        frustumCulled={false}
      />
    </group>
  );
}

