import { useEffect, useMemo, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Color, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type {
  CylinderGeometry,
  Group,
  PlaneGeometry,
  Texture,
} from 'three';
import type { Flavor, FlavorId } from '@/data/flavors';
import { THEMES } from '@/theme/themes';
import {
  CAN_BASE_SCALE,
  CAN_BODY_HEIGHT,
  CAN_BOTTOM_HEIGHT,
  CAN_HALF_HEIGHT,
  CAN_LID_HEIGHT,
} from './arcMath';

/**
 * One miniature Pringles can on the selector arc.
 *
 * Same construction language as the hero can, simplified for scale:
 * shared open-ended cylinder body with a per-flavor label map, metallic
 * gold lid, aluminum bottom cap. All per-frame motion (arc position,
 * scale, tilt, opacity, brightness, idle spin) is driven imperatively by
 * the carousel's useFrame via the registered handle â€” this component only
 * owns its label/shadow materials and the click-to-select raycast target.
 */

/** Geometry/materials shared across all 7 minis (created once, disposed once). */
export interface SharedCanAssets {
  body: CylinderGeometry;
  lid: CylinderGeometry;
  bottom: CylinderGeometry;
  shadowPlane: PlaneGeometry;
  lidMaterial: MeshStandardMaterial;
  bottomMaterial: MeshStandardMaterial;
  shadowTexture: Texture;
}

/** Per-can damped presentation state, mutated by the carousel frame loop. */
export interface MiniCanFrameState {
  scale: number;
  z: number;
  opacity: number;
  brightness: number;
  spin: number;
}

export interface MiniCanHandle {
  outer: Group;
  spin: Group;
  label: MeshStandardMaterial;
  shadow: MeshBasicMaterial;
  state: MiniCanFrameState;
}

interface MiniCanProps {
  flavor: Flavor;
  index: number;
  texture: Texture | null;
  assets: SharedCanAssets;
  register: (index: number, handle: MiniCanHandle | null) => void;
  onSelect: (f: FlavorId) => void;
}

export function MiniCan({
  flavor,
  index,
  texture,
  assets,
  register,
  onSelect,
}: MiniCanProps) {
  const outerRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  const label = useMemo(() => {
    const m = new MeshStandardMaterial({
      transparent: true,
      roughness: 0.35,
      metalness: 0.05,
      opacity: 1, // frame loop drives opacity from arc emphasis
    });
    // Soft glow tinted by this flavor's theme color; intensity is driven
    // per-frame from arc emphasis (active can glows).
    m.emissive = new Color(THEMES[flavor.id].main);
    return m;
  }, [flavor.id]);

  const shadow = useMemo(
    () =>
      new MeshBasicMaterial({
        map: assets.shadowTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [assets.shadowTexture],
  );

  useEffect(() => {
    label.map = texture;
    label.needsUpdate = true;
  }, [label, texture]);

  useEffect(
    () => () => {
      label.dispose();
      shadow.dispose();
    },
    [label, shadow],
  );

  useEffect(() => {
    const outer = outerRef.current;
    const spin = spinRef.current;
    if (!outer || !spin) return;
    register(index, {
      outer,
      spin,
      label,
      shadow,
      // Start at settled emphasis values â€” never collapsed. A frame-damped
      // grow-in keeps cans invisible for many seconds on slow devices
      // (software GL / heavy pages run at a few fps), which read as
      // "selector renders no cans". The frame loop converges from here to
      // the exact arc targets within a frame or two.
      state: { scale: CAN_BASE_SCALE, z: 0, opacity: 1, brightness: 1, spin: 0 },
    });
    return () => register(index, null);
  }, [index, label, shadow, register]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return; // it was a drag, not a tap
    e.stopPropagation();
    onSelect(flavor.id);
  };

  return (
    <group ref={outerRef}>
      {/* fake blob shadow â€” sits just behind/below the can base */}
      <mesh
        geometry={assets.shadowPlane}
        material={shadow}
        position={[0.15, -(CAN_HALF_HEIGHT + 0.05), -1.2]}
        renderOrder={-1}
      />
      <group ref={spinRef} onClick={handleClick}>
        <mesh geometry={assets.body} material={label} />
        <mesh
          geometry={assets.lid}
          material={assets.lidMaterial}
          position={[0, CAN_BODY_HEIGHT / 2 + CAN_LID_HEIGHT / 2, 0]}
        />
        <mesh
          geometry={assets.bottom}
          material={assets.bottomMaterial}
          position={[0, -(CAN_BODY_HEIGHT / 2 + CAN_BOTTOM_HEIGHT / 2), 0]}
        />
      </group>
    </group>
  );
}

