import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

/**
 * useParallax â€” floating-ingredient motion layer.
 *
 * Every `[data-parallax="<depth>"]` element inside the scope gets:
 *  (a) an independent idle float on its first child â€” y sine Â±6pxÂ·depth,
 *      rotation Â±2Â° around its CSS-defined base rotation, randomized phase
 *      and duration (3â€“5s);
 *  (b) damped mouse parallax on the element itself â€” translate toward/away
 *      from the cursor, proportional to depth, max Â±24px (GSAP quickTo).
 *
 * Both layers skip entirely under `prefers-reduced-motion`.
 * All animation is transform-only (GPU) and cleaned up on unmount.
 */
export function useParallax(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const quicks: {
      xTo: (v: number) => void;
      yTo: (v: number) => void;
      depth: number;
    }[] = [];

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>('[data-parallax]', scope);

      els.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax ?? '') || 0.5;
        const inner = (el.firstElementChild as HTMLElement | null) ?? el;
        // Preserve any base rotation coming from CSS (e.g. rotate-6) so the
        // wobble orbits the designed angle instead of zero.
        const baseRot = Number(gsap.getProperty(inner, 'rotation')) || 0;
        const amp = 6 * depth;

        // (a) idle float â€” two desynchronized yoyo loops for organic drift
        gsap.fromTo(
          inner,
          { y: -amp },
          {
            y: amp,
            duration: gsap.utils.random(3, 5),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: gsap.utils.random(0, 2.5),
          },
        );
        gsap.fromTo(
          inner,
          { rotation: baseRot - 2 },
          {
            rotation: baseRot + 2,
            duration: gsap.utils.random(3, 5),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: gsap.utils.random(0, 2.5),
          },
        );

        // (b) damped mouse parallax (targets resolved on each pointer move)
        quicks.push({
          xTo: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
          yTo: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
          depth,
        });
      });
    }, scope);

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      for (const q of quicks) {
        q.xTo(nx * 24 * q.depth);
        q.yTo(ny * 24 * q.depth);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      quicks.length = 0;
      ctx.revert();
    };
  }, [scopeRef]);
}

