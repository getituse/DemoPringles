import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { FLAVORS, FLAVOR_LIST } from '@/data/flavors';
import type { FlavorId } from '@/data/flavors';
import { useStageScale } from './stage';
import type { HeroInteraction } from './HeroCanScene';

/**
 * `<PringlesCan flavor>` â€” the hero product render.
 *
 * Real geometry: open-ended cylinder body wrapped with the flavor label
 * texture, separate brushed-gold lid (cylinder + domed disc + torus rim),
 * separate aluminum bottom cap. Tall Pringles proportions (~1:3 âŒ€:h).
 *
 * Motion (all useFrame + damped values, no raw setState):
 *  - idle slow rotation (~12Â°/s) after 2.5s of pointer inactivity
 *  - drag-to-spin with velocity, inertia and damping
 *  - pointer parallax tilt (Â±0.12 rad, damped)
 *  - hover lift + tilt + stronger env reflections
 *  - GSAP flavor transition: spin away + fade out â†’ texture swap at
 *    opacity 0 â†’ spin forward + fade in (~1.5s, power3)
 */

const BODY_R = 0.55;
const BODY_H = 3.0; // total can height â‰ˆ 3.3 â†’ âŒ€1.1 : h3.3 â‰ˆ 1:3
const DRAG_SPEED = 0.008; // rad per dragged pixel
const IDLE_SPEED = 0.21; // rad/s (~12Â°/s)

interface CanGeometries {
  body: THREE.CylinderGeometry;
  lid: THREE.CylinderGeometry;
  dome: THREE.SphereGeometry;
  rim: THREE.TorusGeometry;
  bottom: THREE.CylinderGeometry;
}

let sharedGeos: CanGeometries | null = null;
function getCanGeometries(): CanGeometries {
  if (!sharedGeos) {
    sharedGeos = {
      body: new THREE.CylinderGeometry(BODY_R, BODY_R, BODY_H, 96, 1, true),
      lid: new THREE.CylinderGeometry(BODY_R + 0.02, BODY_R + 0.02, 0.1, 96),
      dome: new THREE.SphereGeometry(
        BODY_R + 0.015,
        48,
        12,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ),
      rim: new THREE.TorusGeometry(BODY_R + 0.015, 0.018, 12, 72),
      bottom: new THREE.CylinderGeometry(BODY_R + 0.01, BODY_R - 0.02, 0.08, 96),
    };
  }
  return sharedGeos;
}

/** Every label texture this component has touched â€” disposed on unmount. */
const seenLabelTextures = new Set<THREE.Texture>();

interface CanDriver {
  /** GSAP transition: extra spin added to yaw */
  spin: number;
  /** GSAP transition: z push-back */
  z: number;
  /** GSAP transition: uniform scale multiplier */
  scale: number;
  /** GSAP transition: switch fade */
  opacity: number;
  /** load entrance */
  introY: number;
  introOp: number;
}

export default function PringlesCan({
  flavor,
  interaction,
  reduced,
}: {
  flavor: FlavorId;
  interaction: RefObject<HeroInteraction>;
  reduced: boolean;
}) {
  // `displayed` = flavor whose texture is actually on the can right now.
  const [displayed, setDisplayed] = useState<FlavorId>(flavor);
  const texture = useTexture(FLAVORS[displayed].labelTexture);

  // texture configuration (sRGB, horizontal wrap, anisotropy)
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    seenLabelTextures.add(texture);
  }, [texture]);

  const geos = getCanGeometries();

  const materials = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.35, // print sheen
      clearcoatRoughness: 0.3,
      envMapIntensity: 1,
      transparent: true,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C9A227'), // brushed gold lid
      metalness: 0.95,
      roughness: 0.26,
      envMapIntensity: 1,
      transparent: true,
    });
    const aluminum = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D8D8D8'), // aluminum bottom cap
      metalness: 0.85,
      roughness: 0.35,
      envMapIntensity: 1,
      transparent: true,
    });
    return { body, gold, aluminum };
  }, []);

  useEffect(() => {
    materials.body.map = texture;
    materials.body.needsUpdate = true;
  }, [materials, texture]);

  const rootRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  const driver = useRef<CanDriver>({
    spin: 0,
    z: 0,
    scale: 1,
    opacity: 1,
    introY: -0.5,
    introOp: 0,
  });
  const yaw = useRef(0.4); // start slightly turned so the render reads 3D
  const velocity = useRef(0);
  const hoverT = useRef(0);
  const generation = useRef(0);
  const firstFlavor = useRef(true);
  const textureRef = useRef(texture);
  textureRef.current = texture;
  const prevLabel = useRef<{ url: string; tex: THREE.Texture } | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const stageScale = useStageScale();
  const stageScaleRef = useRef(stageScale);
  stageScaleRef.current = stageScale;

  // ---- load entrance: can rises + fades in ----
  useEffect(() => {
    const d = driver.current;
    if (reducedRef.current) {
      d.introY = 0;
      const tw = gsap.to(d, {
        introOp: 1,
        duration: 0.4,
        ease: 'power1.out',
        delay: 0.2,
      });
      return () => {
        tw.kill();
      };
    }
    const tw = gsap.to(d, {
      introY: 0,
      introOp: 1,
      duration: 1.2,
      ease: 'expo.out',
      delay: 0.6,
    });
    return () => {
      tw.kill();
    };
  }, []);

  // ---- flavor change: cinematic swap (or fade-only when reduced) ----
  useEffect(() => {
    if (firstFlavor.current) {
      firstFlavor.current = false;
      return;
    }
    const g = ++generation.current;
    const d = driver.current;
    gsap.killTweensOf(d);

    if (flavor === displayed) {
      // switch was reversed mid-transition â€” settle back to front
      gsap.to(d, {
        z: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      });
      return;
    }

    // start fetching the next label immediately so it is ready by swap time
    useTexture.preload(FLAVORS[flavor].labelTexture);

    if (reducedRef.current) {
      // reduced motion: 0.4s opacity-only crossfade, swap at 50%
      gsap
        .timeline()
        .to(d, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0)
        .call(
          () => {
            if (generation.current !== g) return;
            prevLabel.current = {
              url: FLAVORS[displayed].labelTexture,
              tex: textureRef.current,
            };
            setDisplayed(flavor);
          },
          [],
          0.2,
        )
        .to(d, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0.22);
      return;
    }

    // exit: spin away, push back, shrink, fade (0.65s power3.in)
    gsap
      .timeline()
      .to(
        d,
        {
          spin: d.spin + Math.PI,
          z: -1.2,
          scale: 0.85,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.in',
        },
        0,
      )
      .call(() => {
        if (generation.current !== g) return;
        prevLabel.current = {
          url: FLAVORS[displayed].labelTexture,
          tex: textureRef.current,
        };
        setDisplayed(flavor); // texture swap happens at opacity 0
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavor]);

  // ---- enter phase once the new label is committed ----
  useEffect(() => {
    const disposePrev = () => {
      const prev = prevLabel.current;
      if (!prev) return;
      prevLabel.current = null;
      if (prev.tex !== textureRef.current) {
        useTexture.clear(prev.url); // drop loader cache so it can re-fetch
        prev.tex.dispose();
        seenLabelTextures.delete(prev.tex);
      }
    };
    if (displayed === flavor && driver.current.introOp === 0) return; // mount
    if (reducedRef.current) {
      disposePrev();
      return;
    }
    const d = driver.current;
    const tw = gsap.to(d, {
      spin: d.spin + Math.PI, // completes a full extra turn, front-facing
      z: 0,
      scale: 1,
      opacity: 1,
      duration: 0.85,
      ease: 'power3.out',
      onComplete: disposePrev,
    });
    return () => {
      tw.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed]);

  // ---- unmount cleanup: tweens, materials, textures ----
  useEffect(
    () => () => {
      gsap.killTweensOf(driver.current);
      materials.body.dispose();
      materials.gold.dispose();
      materials.aluminum.dispose();
      seenLabelTextures.forEach((t) => t.dispose());
      seenLabelTextures.clear();
      FLAVOR_LIST.forEach((f) => useTexture.clear(f.labelTexture));
    },
    [materials],
  );

  // ---- per-frame physics ----
  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const ix = interaction.current;
    const d = driver.current;
    const now = performance.now() / 1000;

    // drag / inertia / idle rotation
    if (ix.dragging) {
      yaw.current += ix.dragDX * DRAG_SPEED;
      const inst = (ix.dragDX * DRAG_SPEED) / Math.max(dt, 1e-3);
      velocity.current = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(velocity.current, inst, 0.6),
        -7,
        7,
      );
      ix.dragDX = 0;
      ix.lastActive = now;
    } else {
      if (Math.abs(velocity.current) > 0.02) {
        yaw.current += velocity.current * dt;
        velocity.current *= Math.pow(0.94, dt * 60); // inertia damping
      } else {
        velocity.current = 0;
      }
      if (!reducedRef.current && now - ix.lastActive > 2.5) {
        yaw.current += IDLE_SPEED * dt;
      }
    }

    // hover lift
    hoverT.current = THREE.MathUtils.damp(
      hoverT.current,
      ix.inside ? 1 : 0,
      6,
      dt,
    );

    const root = rootRef.current;
    const tilt = tiltRef.current;
    const spin = spinRef.current;
    if (!root || !tilt || !spin) return;

    root.position.set(0, d.introY + 0.12 * hoverT.current, d.z);
    root.scale.setScalar(stageScaleRef.current * d.scale);

    const par = reducedRef.current ? 0 : 1;
    tilt.rotation.x = THREE.MathUtils.damp(
      tilt.rotation.x,
      par * -ix.pointer.y * 0.12 + 0.06 * hoverT.current,
      4,
      dt,
    );
    tilt.rotation.y = THREE.MathUtils.damp(
      tilt.rotation.y,
      par * ix.pointer.x * 0.12,
      4,
      dt,
    );
    tilt.rotation.z = THREE.MathUtils.damp(
      tilt.rotation.z,
      par * -ix.pointer.x * 0.04,
      4,
      dt,
    );
    spin.rotation.y = yaw.current + d.spin;

    // fade + hover reflections
    const op = d.opacity * d.introOp;
    materials.body.opacity = op;
    materials.gold.opacity = op;
    materials.aluminum.opacity = op;
    const envTarget = ix.inside ? 1.5 : 1;
    materials.body.envMapIntensity = THREE.MathUtils.damp(
      materials.body.envMapIntensity,
      envTarget,
      6,
      dt,
    );
    materials.gold.envMapIntensity = materials.body.envMapIntensity;
    materials.aluminum.envMapIntensity = materials.body.envMapIntensity;
  });

  return (
    <group ref={rootRef}>
      <group ref={tiltRef}>
        <group ref={spinRef}>
          <mesh geometry={geos.body} material={materials.body} />
          {/* metallic gold lid: cylinder + domed disc + torus rim */}
          <mesh
            geometry={geos.lid}
            material={materials.gold}
            position={[0, BODY_H / 2 + 0.05, 0]}
          />
          <mesh
            geometry={geos.dome}
            material={materials.gold}
            position={[0, BODY_H / 2 + 0.1, 0]}
            scale={[1, 0.28, 1]}
          />
          <mesh
            geometry={geos.rim}
            material={materials.gold}
            position={[0, BODY_H / 2 + 0.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          {/* aluminum bottom cap */}
          <mesh
            geometry={geos.bottom}
            material={materials.aluminum}
            position={[0, -BODY_H / 2 - 0.04, 0]}
          />
        </group>
      </group>
    </group>
  );
}

