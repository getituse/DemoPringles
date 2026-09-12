import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFlavor } from '@/theme/useFlavorTheme';
import { FLAVORS } from '@/data/flavors';
import StripedCircle from '@/components/StripedCircle';
import HeroCanScene from '@/three/hero/HeroCanScene';
import SelectorScene from '@/three/selector/SelectorScene';
import { useParallax } from '@/hooks/useParallax';
import {
  SquiggleMark,
  CircularArrowIcon,
  WaveLinesIcon,
  HeartIcon,
  FeatherIcon,
} from '@/components/icons';

gsap.registerPlugin(ScrollTrigger);

/**
 * Home â€” the full landing page.
 * Top ivory section (hero + right rail) and the deep-flavor bottom band
 * (selector + portrait + quote). First paint = reference image.
 *
 * Motion layer (this file owns all DOM animation):
 *  - first-load entrance timeline (hero copy, circle, rail, ingredients)
 *  - ScrollTrigger band entrance (arc, hand, portrait, quote, doodles)
 *  - flavor-switch copy crossfade + ingredient opacity dip
 *  - `[data-parallax]` idle float + mouse parallax via useParallax
 * 3D canvases (hero can, selector) are self-managed under src/three/**.
 */

const REDUCED = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- */
/* Feature rail data                                    */
/* ---------------------------------------------------------------- */
const FEATURES = [
  {
    title: 'Wavy',
    caption: 'Every wave is poppin with delicious flavor.',
    Icon: WaveLinesIcon,
  },
  {
    title: 'Favorites',
    caption: 'Every pringle crisp is your favorites crisp.',
    Icon: HeartIcon,
  },
  {
    title: 'Lighter Side',
    caption: 'Every crisp lightly salted or reduced fat.',
    Icon: FeatherIcon,
  },
] as const;

const QUOTE =
  'â€œEvery crisp is my favorite crisp when theyâ€™re Pringles. I canâ€™t even think of any other potato chips but pringles.â€';

/* ---------------------------------------------------------------- */
/* Small decorative SVGs                    */
/* ---------------------------------------------------------------- */
function DotGrid({ className = '' }: { className?: string }) {
  return (
    <svg
      width="70"
      height="48"
      viewBox="0 0 70 48"
      aria-hidden
      className={className}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <circle
            key={i}
            cx={4 + col * 18}
            cy={4 + row * 16}
            r="3"
            fill="var(--gray-soft)"
            opacity="0.55"
          />
        );
      })}
    </svg>
  );
}

function DashedArc({ className = '' }: { className?: string }) {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      aria-hidden
      className={className}
    >
      <circle
        cx="90"
        cy="90"
        r="80"
        fill="none"
        stroke="var(--gray-soft)"
        strokeWidth="2"
        strokeDasharray="4 8"
        strokeLinecap="round"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ChiliDoodles({ className = '' }: { className?: string }) {
  return (
    <svg
      width="120"
      height="110"
      viewBox="0 0 120 110"
      aria-hidden
      data-hero="chili"
      className={`animate-chili-sway ${className}`}
      fill="none"
      stroke="var(--red)"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <g className="origin-[30px_30px]">
        <path d="M18 22c10-8 26-6 32 4 5 9 1 20-8 24-10 4-22-1-26-10" />
        <path d="M48 24c3-6 8-9 14-9" />
        <path d="M50 30c4-4 9-5 13-4" />
      </g>
      <g>
        <path d="M70 62c8-7 22-6 27 3 4 8 0 17-7 20-8 3-18-1-21-9" />
        <path d="M95 63c3-5 7-8 12-8" />
      </g>
      <g>
        <path d="M26 76c6-5 16-4 20 2 3 6 0 13-5 15-6 3-14 0-16-6" />
        <path d="M44 77c2-4 5-6 9-6" />
      </g>
    </svg>
  );
}

function BandDoodles() {
  return (
    <>
      {/* lightning bolt */}
      <svg
        width="40"
        height="52"
        viewBox="0 0 40 52"
        aria-hidden
        className="absolute left-[38%] top-[8%] opacity-50"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          data-band="doodle"
          pathLength={1}
          strokeDasharray={1}
          d="M22 4 8 28h10l-4 20 18-26H20l2-18Z"
        />
      </svg>
      {/* squiggle */}
      <svg
        width="64"
        height="20"
        viewBox="0 0 64 20"
        aria-hidden
        className="absolute left-[22%] top-[4%] opacity-50"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path
          data-band="doodle"
          pathLength={1}
          strokeDasharray={1}
          d="M2 12c6-8 12-8 18 0s12 8 18 0 12-8 18 0"
        />
      </svg>
      {/* small ring */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        aria-hidden
        className="absolute right-[16%] bottom-[12%] opacity-50"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <circle
          data-band="doodle"
          pathLength={1}
          strokeDasharray={1}
          cx="15"
          cy="15"
          r="11"
        />
      </svg>
      {/* small pear/doodle left edge */}
      <svg
        width="34"
        height="40"
        viewBox="0 0 34 40"
        aria-hidden
        className="absolute left-[3%] top-[10%] opacity-50"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path
          data-band="doodle"
          pathLength={1}
          strokeDasharray={1}
          d="M17 8c6 0 10 6 10 13 0 8-5 13-10 13S7 29 7 21c0-7 4-13 10-13Z"
        />
        <path
          data-band="doodle"
          pathLength={1}
          strokeDasharray={1}
          d="M17 8c0-3 2-5 5-5"
        />
      </svg>
    </>
  );
}

/** Selector arc SVG: dashed ring + orange arc + white disc. */
function SelectorArc() {
  return (
    <svg
      width="440"
      height="240"
      viewBox="0 0 440 240"
      aria-hidden
      className="absolute bottom-0 left-[clamp(8px,4vw,60px)] z-[1]"
    >
      {/* outer dashed green ring (only top half visible) */}
      <circle
        data-band="arc-ring"
        cx="220"
        cy="240"
        r="210"
        fill="none"
        stroke="#3E8A78"
        strokeWidth="2"
        strokeDasharray="6 8"
        strokeLinecap="round"
      />
      {/* middle solid amber ring segment 180Â°â†’360Â° (draws in on scroll) */}
      <path
        data-band="arc-seg"
        pathLength={1}
        strokeDasharray={1}
        d="M 34 240 A 186 186 0 0 1 406 240"
        fill="none"
        stroke="var(--brand-amber)"
        strokeWidth="34"
      />
      {/* inner white disc with logo */}
      <circle data-band="arc-disc" cx="220" cy="240" r="120" fill="var(--white)" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */
export default function Home() {
  const { flavor, setFlavor } = useFlavor();
  const data = FLAVORS[flavor];
  const rootRef = useRef<HTMLDivElement>(null);

  // Copy crossfade: `copyFlavor` lags `flavor` â€” text swaps at opacity 0
  // inside the GSAP crossfade.
  const [copyFlavor, setCopyFlavor] = useState(flavor);
  const copy = FLAVORS[copyFlavor];
  const copyIsDefault = copyFlavor === 'jalapeno';
  const firstCopy = useRef(true);
  const firstFlavor = useRef(true);
  // The flavor-switch timeline lives in a ref so the effect's cleanup can
  // NEVER kill it mid-flight (the timeline's own setCopyFlavor callback
  // re-runs the effect â€” a cleanup kill there was permanently stranding
  // the ingredient opacity dip at ~0.3). Only a newer switch replaces it.
  const switchTlRef = useRef<gsap.core.Timeline | null>(null);
  // Latch: has the band once-entrance started? Before it has, band
  // elements sit at opacity 0 awaiting the reveal and must be excluded
  // from the ingredient dip/reconcile.
  const bandEnteredRef = useRef(false);

  // Floating-ingredient parallax (idle float + damped mouse parallax)
  useParallax(rootRef);

  /* ---- Dismiss the "Try" hand after the first wheel selection ------ */
  // Quick fade+scale out, then latched hidden via [data-hand-dismissed]
  // (CSS !important) so a later band-entrance replay can never resurrect it.
  useEffect(() => {
    if (firstFlavor.current) {
      firstFlavor.current = false;
      return;
    }
    const hand = rootRef.current?.querySelector<HTMLElement>(
      '[data-band="hand"]',
    );
    if (!hand || hand.hasAttribute('data-hand-dismissed')) return;
    gsap.to(hand, {
      opacity: 0,
      scale: 0.6,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => hand.setAttribute('data-hand-dismissed', ''),
    });
  }, [flavor]);

  /* ---- First-load entrance + band scroll entrance ---------------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || REDUCED()) return;

    const ctx = gsap.context(() => {
      // First-load entrance
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from(
          '[data-hero="circle"]',
          {
            scale: 0.7,
            rotation: -20,
            opacity: 0,
            duration: 1,
            // restore Tailwind's -translate-1/2 centering once settled
            clearProps: 'transform,opacity',
          },
          0.3,
        )
        .from('[data-hero="eyebrow"]', { opacity: 0, duration: 0.5 }, 0.35)
        .from(
          '[data-hero="line"]',
          { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 },
          0.4,
        )
        .from(
          '[data-hero="paragraph"]',
          { y: 20, opacity: 0, duration: 0.7 },
          0.85,
        )
        .from(
          '[data-hero="cta"]',
          { scale: 0.94, opacity: 0, duration: 0.6, ease: 'back.out(1.4)' },
          1.0,
        )
        .from(
          '[data-hero="ingredient"]',
          {
            scale: 0.6,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.5)',
            stagger: 0.1,
          },
          1.1,
        )
        .from(
          '[data-hero="feature"]',
          { x: 40, opacity: 0, duration: 0.8, stagger: 0.12 },
          0.9,
        )
        .from(
          '[data-hero="chili"]',
          { opacity: 0, rotation: 30, duration: 0.8 },
          1.2,
        );

      // Band entrance on scroll into view
      const band = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-band-root]',
          start: 'top 75%',
          once: true,
        },
        defaults: { ease: 'expo.out' },
        // Latch the entrance start so the flavor-switch dip/reconcile knows
        // band imagery is live (before this, it awaits the reveal at op 0).
        onStart: () => {
          bandEnteredRef.current = true;
        },
      });
      band
        .fromTo(
          '[data-band="arc-ring"]',
          { opacity: 0, scale: 0.92, svgOrigin: '220 240' },
          { opacity: 1, scale: 1, duration: 0.9 },
          0,
        )
        .fromTo(
          '[data-band="arc-seg"]',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1 },
          0.1,
        )
        .fromTo(
          '[data-band="arc-disc"]',
          { scale: 0, svgOrigin: '220 240' },
          { scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
          0.2,
        )
        .fromTo(
          '[data-band="arc-logo"]',
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
          0.55,
        )
        .fromTo(
          '[data-band="hand"]',
          {
            opacity: 0,
            scale: 0,
            rotation: -25,
            transformOrigin: '50% 100%',
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: 'back.out(2)',
          },
          0.7,
        )
        .fromTo(
          '[data-band="portrait"]',
          { opacity: 0, y: 60 },
          // clearProps: drop the settle transform so this static wrapper
          // doesn't keep an artificial stacking context after entrance.
          { opacity: 1, y: 0, duration: 1, clearProps: 'transform' },
          0.35,
        )
        .fromTo(
          '[data-band="word"]',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 },
          0.5,
        )
        .fromTo(
          '[data-band="signature"]',
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.6 },
          1.0,
        )
        .fromTo(
          '[data-band="caption"]',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          1.2,
        )
        .fromTo(
          '[data-band="doodle"]',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, stagger: 0.12 },
          0.3,
        )
        .fromTo(
          '[data-band="scatter"]',
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.6)',
            stagger: 0.1,
          },
          0.4,
        );
    }, root);

    return () => ctx.revert(); // kills timelines + ScrollTriggers
  }, []);

  /* ---- Flavor switch: copy crossfade + ingredient dip (Â§6) ------- */
  useEffect(() => {
    if (flavor === copyFlavor) return;
    const root = rootRef.current;
    if (!root) {
      setCopyFlavor(flavor);
      return;
    }
    const targets = root.querySelectorAll('[data-copy]');
    // Imagery dip targets: hero + band parallax layers â€” but NEVER band
    // elements before their once-entrance has run (they sit at opacity 0
    // awaiting the reveal; dipping them would flash/stick them early).
    const ingredients = gsap.utils
      .toArray<HTMLElement>('[data-parallax]', root)
      .filter((el) => bandEnteredRef.current || !el.closest('[data-band-root]'));

    if (REDUCED()) {
      // Reduced-motion variant: fade-only crossfade
      const t = gsap.to(targets, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => setCopyFlavor(flavor),
      });
      return () => {
        t.kill();
      };
    }

    // Guaranteed convergence: whatever happens mid-flight (rapid successive
    // switches killing this timeline, entrance races), the settled state of
    // every dipped layer is full opacity with no lingering inline styles.
    // (Only opacity is cleared â€” transforms belong to useParallax's idle
    // float / mouse quickTo loops and must not be disturbed.)
    const reconcile = () => {
      ingredients.forEach((el) =>
        gsap.set(el, { opacity: 1, clearProps: 'opacity' }),
      );
    };

    // Replace (not cleanup-kill) any previous switch timeline. The cleanup
    // of THIS effect must never kill the timeline: the timeline's own
    // setCopyFlavor callback below re-runs the effect, and killing there
    // stranded every ingredient at mid-dip opacity (~0.3 ghosting).
    switchTlRef.current?.kill();

    const tl = gsap.timeline({ onComplete: reconcile });
    tl.to(targets, {
      opacity: 0,
      y: -12,
      duration: 0.35,
      ease: 'power2.in',
      stagger: 0.05,
      overwrite: 'auto',
    }, 0)
      .to(
        ingredients,
        { opacity: 0.3, duration: 0.3, ease: 'power2.inOut', overwrite: 'auto' },
        0.1,
      )
      .add(() => setCopyFlavor(flavor), 0.4) // text swaps at opacity 0
      .to(
        ingredients,
        // clearProps: no lingering inline opacity â€” these layers must keep
        // exactly their first-paint stacking (no transient contexts).
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          overwrite: 'auto',
          clearProps: 'opacity',
        },
        0.5,
      );
    switchTlRef.current = tl;
  }, [flavor, copyFlavor]);

  // Kill any in-flight switch timeline only on unmount.
  useEffect(() => {
    return () => {
      switchTlRef.current?.kill();
      switchTlRef.current = null;
    };
  }, []);

  // New copy rises in after the swap (skipped on first render â€” the
  // first-load entrance above owns the initial reveal).
  useEffect(() => {
    if (firstCopy.current) {
      firstCopy.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll('[data-copy]');
    if (REDUCED()) {
      gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }
    gsap.fromTo(
      targets,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'expo.out',
        stagger: 0.06,
        // clear the identity transform once settled â€” no stale stacking
        // contexts left behind by the crossfade.
        clearProps: 'transform',
      },
    );
  }, [copyFlavor]);

  return (
    <div ref={rootRef} className="contents">
      {/* Screen-reader flavor announcements */}
      <div aria-live="polite" className="sr-only">
        Flavor: {data.name}
      </div>

      {/* ============================== HERO ============================== */}
      <section
        aria-label={`Pringles Wavy ${data.name}`}
        className="relative overflow-hidden"
        style={{ minHeight: 'max(640px, calc(100vh - 104px))' }}
      >
        {/* background decorations */}
        <DotGrid className="absolute left-[34%] top-[8%] hidden lg:block" />
        <DashedArc className="absolute right-[26%] top-[38%] hidden xl:block" />
        <ChiliDoodles className="absolute -right-4 top-[130px] hidden lg:block" />

        <div className="grid gap-10 px-[clamp(20px,5vw,72px)] pb-16 pt-[clamp(24px,4vh,46px)] lg:grid-cols-[minmax(400px,528px)_minmax(0,1fr)_auto] lg:gap-4">
          {/* ---------- Left column: copy ---------- */}
          <div className="relative z-20 flex flex-col justify-center">
            {/* eyebrow */}
            <p
              data-hero="eyebrow"
              className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.04em] text-[var(--brand-orange)]"
            >
              <SquiggleMark />
              {copy.eyebrow}
            </p>

            {/* headline â€” copy crossfades on flavor switch */}
            <h1
              data-copy
              className="mt-6 max-w-[520px] font-display text-[clamp(40px,5vw,72px)] font-black leading-[1.04] tracking-[-0.01em] text-ink"
            >
              <span data-hero="line" className="block">
                {copy.headline[0]}
              </span>
              <span data-hero="line" className="block">
                {copy.headline[1]}
              </span>
              <span data-hero="line" className="block">
                <span
                  style={{
                    color: copyIsDefault ? 'var(--ink)' : 'var(--flavor-main)',
                  }}
                >
                  {copy.headline[2]}
                </span>
              </span>
            </h1>

            <p
              data-copy
              data-hero="paragraph"
              className="mt-8 max-w-[46ch] text-sm font-normal leading-[1.6] text-gray-wavy"
            >
              {copy.paragraph}
            </p>

            {/* CTA row */}
            <div data-hero="cta" className="mt-11 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="group flex h-14 w-[176px] items-center justify-between rounded-[14px] bg-[var(--flavor-cta)] pl-7 pr-3 text-[15px] font-medium text-white shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-[3px] hover:bg-[var(--flavor-cta-hover)] hover:shadow-[var(--shadow-hover),0_0_0_6px_var(--flavor-glow)] active:scale-[0.97]"
              >
                Try it Now
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/[0.12] transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-90">
                  <CircularArrowIcon />
                </span>
              </button>

              <button
                type="button"
                className="group flex items-center gap-4"
                aria-label="View SmartLabel"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-soft)] ring-[3px] ring-[var(--brand-amber)] transition-all duration-500 group-hover:rotate-[25deg] group-hover:scale-[1.06] group-hover:ring-[var(--flavor-main)] group-hover:shadow-[0_0_0_6px_var(--flavor-glow)]">
                  <img
                    src="/smartlabel-preview.png"
                    alt="Wavy crisp close-up"
                    className="h-full w-full rounded-full object-cover"
                    width={56}
                    height={56}
                  />
                </span>
                <span className="text-sm font-medium text-ink underline decoration-[var(--brand-orange)] decoration-1 underline-offset-4 transition-transform duration-300 group-hover:translate-y-[2px]">
                  View SmartLabel
                </span>
              </button>
            </div>
          </div>

          {/* ---------- Center/right visual stage ---------- */}
          {/* `isolate`: every layer inside (circle z-1, canvas z-2,
              ingredients z-1/3) resolves its stacking locally, so flavor /
              parallax transforms elsewhere can never reorder the stage. */}
          <div className="relative isolate mx-auto h-[min(78vw,560px)] w-full max-w-[640px] lg:h-[640px] lg:max-w-none">
            {/* striped circle (z 1, behind can) â€” wrapper owns the entrance
                so the circle's own CSS float/spin stays untouched */}
            <div
              data-hero="circle"
              className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
            >
              <StripedCircle />
            </div>

            {/* jalapeÃ±o slices (z 1, behind can) */}
            <div
              data-parallax="0.3"
              className="absolute right-[4%] top-[56%] z-[1] w-[130px]"
            >
              <img
                src="/jalapeno-slices.png"
                alt=""
                width={130}
                height={130}
                data-hero="ingredient"
                className="h-auto w-full"
              />
            </div>

            {/* hero 3D can mount (z 2, transparent canvas region ~520Ã—640) */}
            <HeroCanScene
              flavor={flavor}
              className="absolute left-1/2 top-1/2 z-[2] h-full max-h-[640px] w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            />

            {/* potato slices (z 3, in front of can, left edge) */}
            <div
              data-parallax="0.45"
              className="absolute left-[2%] top-[44%] z-[3] w-[150px]"
            >
              <img
                src="/potato-slices.png"
                alt=""
                width={150}
                height={150}
                data-hero="ingredient"
                className="h-auto w-full"
              />
            </div>

            {/* sauce bowl (z 3, bottom-left of circle â€” nearest layer) */}
            <div
              data-parallax="0.65"
              className="absolute bottom-[6%] left-[16%] z-[3] w-[110px]"
            >
              <img
                src="/sauce-bowl.png"
                alt=""
                width={110}
                height={110}
                data-hero="ingredient"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* ---------- Right rail: features ---------- */}
          <aside
            aria-label="Product features"
            className="relative z-20 flex flex-row flex-wrap gap-10 self-center lg:flex-col lg:gap-[88px] lg:pr-2"
          >
            {FEATURES.map(({ title, caption, Icon }) => (
              <div key={title} data-hero="feature" className="group flex items-start gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_0_6px_var(--flavor-glow)]">
                  <Icon className="feature-icon" />
                </span>
                <div className="max-w-[170px] transition-transform duration-300 group-hover:translate-x-[3px]">
                  <h3 className="text-base font-semibold leading-[1.3] text-ink">
                    {title}
                  </h3>
                  <p className="mt-1 text-[13px] font-normal leading-[1.45] text-gray-wavy">
                    {caption}
                  </p>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {/* pistachio scatter â€” bottom-right corner near the band */}
        <div
          data-parallax="0.4"
          className="absolute bottom-4 right-6 z-[5] w-[110px]"
        >
          <img
            src="/pistachio-scatter.png"
            alt=""
            width={110}
            height={82}
            data-hero="ingredient"
            className="h-auto w-full rotate-6"
          />
        </div>
      </section>

      {/* ============================== BAND ============================== */}
      <section
        data-band-root
        aria-label="Flavor selector and testimonial"
        className="relative min-h-[340px] overflow-hidden lg:min-h-[360px]"
        style={{
          background:
            'linear-gradient(160deg, var(--flavor-deep-2) 0%, var(--flavor-deep) 55%)',
        }}
      >
        <BandDoodles />

        {/* parallax scatter layers */}
        <div
          data-parallax="0.6"
          data-band="scatter"
          className="absolute left-[46%] top-[10%] z-[1] w-[70px] lg:top-[16%]"
        >
          <img
            src="/chip-crisps.png"
            alt=""
            width={90}
            height={90}
            className="h-auto w-full rotate-12"
          />
        </div>
        <div
          data-parallax="0.5"
          data-band="scatter"
          className="absolute bottom-[10%] right-[4%] z-[1] w-[120px]"
        >
          <img
            src="/pistachio-scatter.png"
            alt=""
            width={120}
            height={90}
            className="h-auto w-full -rotate-6"
          />
        </div>

        <div className="relative grid px-[clamp(20px,5vw,72px)] lg:grid-cols-[minmax(420px,560px)_minmax(220px,340px)_minmax(0,1fr)]">
          {/* ---------- Selector zone ---------- */}
          {/* self-end keeps the wheel grounded at the band's bottom edge if
              a sibling column (quote) ever outgrows the zone height. */}
          <div className="relative h-[340px] self-end lg:h-[360px]">
            <SelectorArc />
            {/* white disc logo */}
            <img
              src="/logo-pringles.png"
              alt=""
              width={150}
              height={150}
              data-band="arc-logo"
              className="absolute bottom-[-40px] left-[clamp(8px,4vw,60px)] z-[2] ml-[145px] w-[150px]"
            />
            {/* 3D selector canvas mount â€” sits above the arc SVG */}
            <SelectorScene
              flavor={flavor}
              onSelect={setFlavor}
              className="absolute left-0 top-0 z-[3] h-[340px] w-full max-w-[600px] cursor-grab active:cursor-grabbing lg:h-[360px]"
            />
            {/* hand pointer at the arc's right end, pointing up */}
            <div
              data-band="hand"
              className="absolute bottom-[64px] left-[clamp(8px,4vw,60px)] z-[4] ml-[330px] w-[110px]"
            >
              <img
                src="/hand-pointer.png"
                alt=""
                width={110}
                height={138}
                className="animate-wavy-bob h-auto w-full -rotate-6"
              />
            </div>
          </div>

          {/* ---------- Portrait ---------- */}
          {/* Visible at every viewport: between the selector and the quote
              on mobile/tablet (scaled down), full height on desktop. z-[2]
              keeps it latched in front of the band background / doodles /
              scatter at all times. */}
          {/* ---------- Reviewer Avatar ---------- */}
          <div className="relative z-[2] flex items-center justify-center py-6 lg:py-0">
            <div data-band="portrait" className="flex items-center justify-center">
              <div data-parallax="0.3" className="relative">
                <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-4 ring-[var(--flavor-main)]/30 transition-transform duration-300 hover:scale-105 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                  <img
                    src="/reviewer-avatar.jpg"
                    alt="Verified Snack Reviewer"
                    width={240}
                    height={240}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-ink shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Reviewer
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Quote ---------- */}
          <figure className="relative z-[2] flex flex-col justify-center py-14 lg:py-0 lg:pl-10">
            <svg
              width="60"
              height="48"
              viewBox="0 0 60 48"
              aria-hidden
              className="mb-5 text-white/25"
              fill="currentColor"
            >
              <path d="M24 0 14 22c4 1 7 4 7 9 0 6-4 10-10 10S0 36 0 29C0 26 1 23 2 20L14 0h10Zm36 0-10 22c4 1 7 4 7 9 0 6-4 10-10 10s-11-5-11-12c0-3 1-6 2-9L50 0h10Z" />
            </svg>
            <blockquote className="max-w-[400px] font-display text-[22px] font-medium italic leading-[1.5] text-white">
              {QUOTE.split(' ').map((word, i, arr) => (
                <span key={i}>
                  <span data-band="word" className="inline-block">
                    {word}
                  </span>
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </blockquote>
            <figcaption className="mt-6">
              <span
                data-band="signature"
                className="block font-signature text-3xl leading-[1.2] text-white/90"
              >
                Alex M.
              </span>
              <span
                data-band="caption"
                className="mt-1 block text-sm font-medium text-white/80"
              >
                Verified Buyer • Snack Enthusiast
              </span>
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}

