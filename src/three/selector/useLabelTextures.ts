import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Texture } from 'three';
import type { FlavorId } from '@/data/flavors';
import { DEFAULT_FLAVOR, FLAVOR_LIST, FLAVORS } from '@/data/flavors';
import type { Flavor } from '@/data/flavors';

export type LabelTextureMap = Record<FlavorId, Texture | null>;

function emptyMap(): LabelTextureMap {
  return {
    jalapeno: null,
    original: null,
    sourcream: null,
    bbq: null,
    cheddar: null,
    pizza: null,
    steak: null,
  };
}

/**
 * Lazy label-texture loader for the 7 mini cans.
 *
 * Only the default flavor's label loads immediately; the remaining six load
 * lazily in the background, staggered 250ms apart, so first paint is never
 * blocked. Textures are SRGBColorSpace with anisotropy 8 (capped by the
 * device) and are disposed on unmount.
 */
export function useLabelTextures(): LabelTextureMap {
  const gl = useThree((s) => s.gl);
  const [textures, setTextures] = useState<LabelTextureMap>(emptyMap);

  useEffect(() => {
    let cancelled = false;
    const loader = new TextureLoader();
    const loaded: Texture[] = [];
    const timers: number[] = [];
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    const loadOne = (flavor: Flavor): Promise<void> =>
      new Promise((resolve) => {
        loader.load(
          flavor.labelTexture,
          (tex) => {
            if (cancelled) {
              tex.dispose();
              resolve();
              return;
            }
            tex.colorSpace = SRGBColorSpace;
            tex.anisotropy = anisotropy;
            loaded.push(tex);
            setTextures((prev) => ({ ...prev, [flavor.id]: tex }));
            resolve();
          },
          undefined,
          () => resolve(), // missing texture â†’ theme-color fallback stays
        );
      });

    // Preload default only; lazy-load the rest afterwards.
    void loadOne(FLAVORS[DEFAULT_FLAVOR]).then(() => {
      FLAVOR_LIST.filter((f) => f.id !== DEFAULT_FLAVOR).forEach((f, i) => {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) void loadOne(f);
          }, 250 * (i + 1)),
        );
      });
    });

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      loaded.forEach((t) => t.dispose());
    };
  }, [gl]);

  return textures;
}

