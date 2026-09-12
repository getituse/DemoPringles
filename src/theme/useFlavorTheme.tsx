import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import gsap from 'gsap';
import { DEFAULT_FLAVOR, isFlavorId } from '@/data/flavors';
import type { FlavorId } from '@/data/flavors';
import { FLAVOR_VAR_NAMES, THEMES } from './themes';
import type { ThemeTokens } from './themes';

/**
 * Flavor theme engine.
 *
 * `FlavorProvider` owns the single source of truth for the active flavor.
 * Every `setFlavor(id)` builds ONE GSAP master timeline that tweens all
 * `--flavor-*` CSS custom properties on `document.documentElement`
 * (duration 1.2s, power2.inOut â€” GSAP interpolates color strings natively)
 * and sets the `data-flavor` attribute so CSS attr-selector fallbacks
 * (`:root[data-flavor="â€¦"]` in index.css) stay in sync.
 *
 * Nothing sets theme colors imperatively outside this timeline. Components
 * always read flavor colors via `var(--flavor-*)`.
 *
 * Deep links: `?flavor=<id>` is read on load and kept in sync â€” navigating
 * to `/?flavor=bbq` applies the BBQ theme through the same timeline.
 */

export interface FlavorContextValue {
  flavor: FlavorId;
  setFlavor: (f: FlavorId) => void;
}

const FlavorContext = createContext<FlavorContextValue>({
  flavor: DEFAULT_FLAVOR,
  setFlavor: () => {},
});

const FLAVOR_DURATION = 1.2; // flavor master switch
const REDUCED_DURATION = 0.4; // reduced-motion fade-only

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function initialFlavor(): FlavorId {
  if (typeof window === 'undefined') return DEFAULT_FLAVOR;
  const param = new URLSearchParams(window.location.search).get('flavor');
  return isFlavorId(param) ? param : DEFAULT_FLAVOR;
}

/** Build the tween target object: { "--flavor-main": "#â€¦", â€¦ } */
function varTweenTarget(tokens: ThemeTokens): Record<string, string> {
  const target: Record<string, string> = {};
  (Object.keys(FLAVOR_VAR_NAMES) as (keyof ThemeTokens)[]).forEach((key) => {
    target[FLAVOR_VAR_NAMES[key]] = tokens[key];
  });
  return target;
}

export function FlavorProvider({ children }: { children: ReactNode }) {
  const [flavor, setFlavorState] = useState<FlavorId>(initialFlavor);
  const [searchParams] = useSearchParams();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mountedRef = useRef(false);

  const setFlavor = useCallback((next: FlavorId) => {
    setFlavorState((current) => (current === next ? current : next));
  }, []);

  // Keep state in sync with ?flavor= deep links (e.g. from the Products stub).
  // Render-time state adjustment (react.dev: "adjusting state when props
  // change") â€” no effect, no cascading render.
  const param = searchParams.get('flavor');
  const [prevParam, setPrevParam] = useState(param);
  if (isFlavorId(param) && param !== prevParam) {
    setPrevParam(param);
    if (param !== flavor) setFlavorState(param);
  }

  // THE flavor master timeline: one GSAP timeline tweens every --flavor-* var.
  useEffect(() => {
    const root = document.documentElement;

    if (!mountedRef.current) {
      // First paint: attribute only â€” the :root[data-flavor] CSS rules own the
      // vars, so there is no flash and no JS-driven style write before paint.
      mountedRef.current = true;
      root.setAttribute('data-flavor', flavor);
      return;
    }

    timelineRef.current?.kill();
    root.setAttribute('data-flavor', flavor);

    const tl = gsap.timeline({
      defaults: {
        duration: prefersReducedMotion() ? REDUCED_DURATION : FLAVOR_DURATION,
        ease: 'power2.inOut',
      },
    });
    tl.to(root, varTweenTarget(THEMES[flavor]), 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      if (timelineRef.current === tl) timelineRef.current = null;
    };
  }, [flavor]);

  // Kill any in-flight timeline on unmount.
  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  return (
    <FlavorContext.Provider value={{ flavor, setFlavor }}>
      {children}
    </FlavorContext.Provider>
  );
}

export function useFlavor(): FlavorContextValue {
  return useContext(FlavorContext);
}

/**
 * Standalone hook form of the contract").
 * Returns the active flavor, its token map, and the setter. All color
 * application still flows through the provider's single master timeline.
 */
export function useFlavorTheme() {
  const { flavor, setFlavor } = useFlavor();
  return { flavor, setFlavor, theme: THEMES[flavor] };
}

