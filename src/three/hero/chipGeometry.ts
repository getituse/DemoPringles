import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Master "Pringles Wavy" crisp geometry â€” ONE shared geometry
 * used by every floating-chip instance.
 *
 * Construction:
 *  1. Wavy-edged oval outline (ruffled crisp silhouette).
 *  2. ExtrudeGeometry with depth + bevel â†’ REAL visible thickness.
 *  3. Vertices merged, then displaced along z with a sinusoidal corrugation
 *     plus a slight hyperbolic-paraboloid "cup", so the crisp reads as a wavy
 *     chip from every angle.
 *  4. UVs re-mapped into a single-crisp crop region of `/chip-crisps.png`
 *     (the bottom-left crisp in the photo, ~x 120â€“530px, ~y 610â€“890px).
 */
export function createChipGeometry(): THREE.BufferGeometry {
  // 1. ruffled oval outline
  const outline: THREE.Vector2[] = [];
  const SEGMENTS = 72;
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    const ripple = 1 + 0.06 * Math.sin(a * 9 + 0.6);
    outline.push(
      new THREE.Vector2(Math.cos(a) * 0.34 * ripple, Math.sin(a) * 0.235 * ripple),
    );
  }
  const shape = new THREE.Shape(outline);

  // 2. extrude â†’ solid crisp with thickness + beveled edge
  let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 2,
  });

  // 3. weld + corrugate
  geo = mergeVertices(geo, 1e-4);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // re-center extrusion (depth/2 + bevel â‰ˆ 0.029), then deform:
    let z = pos.getZ(i) - 0.029;
    z += 0.05 * Math.sin((x / 0.36) * Math.PI * 2); // wavy corrugation
    z += 0.09 * (x / 0.36) * (y / 0.26); // hyperbolic-paraboloid cup
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // 4. normalize UVs into the single-crisp crop of the photo texture
  geo.computeBoundingBox();
  const bb = geo.boundingBox as THREE.Box3;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const U0 = 0.12;
  const U1 = 0.52;
  const V0 = 0.13;
  const V1 = 0.4;
  const spanX = Math.max(bb.max.x - bb.min.x, 1e-6);
  const spanY = Math.max(bb.max.y - bb.min.y, 1e-6);
  for (let i = 0; i < uv.count; i++) {
    const nu = (pos.getX(i) - bb.min.x) / spanX;
    const nv = (pos.getY(i) - bb.min.y) / spanY;
    uv.setXY(i, U0 + nu * (U1 - U0), V0 + nv * (V1 - V0));
  }
  uv.needsUpdate = true;

  return geo;
}

