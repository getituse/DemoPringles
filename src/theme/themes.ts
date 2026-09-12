import type { FlavorId } from '@/data/flavors';

/**
 * Flavor theme tokens.
 * Every value maps 1:1 to a `--flavor-*` CSS custom property on :root.
 * The master GSAP timeline (useFlavorTheme) tweens these vars; the
 * `:root[data-flavor="â€¦"]` blocks in index.css mirror them for first paint.
 */
export interface ThemeTokens {
  /** Primary flavor color (accents, rim light tint, headline flavor word) */
  main: string;
  /** Bottom band base gradient end */
  deep: string;
  /** Bottom band gradient start (diagonal light sweep) */
  deep2: string;
  /** Tinted surface (stub hovers, soft surfaces) */
  soft: string;
  /** Striped circle wedge A */
  circleA: string;
  /** Striped circle wedge B */
  circleB: string;
  /** Primary CTA background */
  cta: string;
  /** Primary CTA hover background */
  ctaHover: string;
  /** Glow / ring color (rgba) for focus & hover states */
  glow: string;
}

/** CSS custom property name for each token key. */
export const FLAVOR_VAR_NAMES: Record<keyof ThemeTokens, string> = {
  main: '--flavor-main',
  deep: '--flavor-deep',
  deep2: '--flavor-deep-2',
  soft: '--flavor-soft',
  circleA: '--flavor-circle-a',
  circleB: '--flavor-circle-b',
  cta: '--flavor-cta',
  ctaHover: '--flavor-cta-hover',
  glow: '--flavor-glow',
};

export const THEMES: Record<FlavorId, ThemeTokens> = {
  jalapeno: {
    main: '#1F8A46',
    deep: '#0B5B4C',
    deep2: '#1F6B57',
    soft: '#E3F1E5',
    circleA: '#F5841F',
    circleB: '#FFC61A',
    cta: '#6B3A17',
    ctaHover: '#8A4C1F',
    glow: 'rgba(31,138,70,.35)',
  },
  original: {
    main: '#F2B705',
    deep: '#8A6400',
    deep2: '#B8900A',
    soft: '#FFF3C4',
    circleA: '#FFC61A',
    circleB: '#FFE37E',
    cta: '#7A5C00',
    ctaHover: '#9C7400',
    glow: 'rgba(242,183,5,.35)',
  },
  sourcream: {
    main: '#2F7FC4',
    deep: '#123F63',
    deep2: '#1E5C8C',
    soft: '#DCEBF7',
    circleA: '#2F7FC4',
    circleB: '#7FB2E3',
    cta: '#1D3A52',
    ctaHover: '#2A5478',
    glow: 'rgba(47,127,196,.35)',
  },
  bbq: {
    main: '#C8321E',
    deep: '#6E1508',
    deep2: '#8F2410',
    soft: '#F9E0DA',
    circleA: '#D92B2B',
    circleB: '#F5841F',
    cta: '#571C0E',
    ctaHover: '#732512',
    glow: 'rgba(200,50,30,.35)',
  },
  cheddar: {
    main: '#F5841F',
    deep: '#8F4A08',
    deep2: '#B86410',
    soft: '#FDEBD7',
    circleA: '#F5841F',
    circleB: '#FFC61A',
    cta: '#6B3A17',
    ctaHover: '#8A4C1F',
    glow: 'rgba(245,132,31,.35)',
  },
  pizza: {
    main: '#7B3FA0',
    deep: '#3D1C56',
    deep2: '#5A2E7E',
    soft: '#EBDDF5',
    circleA: '#7B3FA0',
    circleB: '#B07ED4',
    cta: '#4A2358',
    ctaHover: '#61317A',
    glow: 'rgba(123,63,160,.35)',
  },
  steak: {
    main: '#8B5A2B',
    deep: '#3E2410',
    deep2: '#5C3A1A',
    soft: '#EDE0D2',
    circleA: '#8B5A2B',
    circleB: '#C98F4E',
    cta: '#4A2C12',
    ctaHover: '#5F3B1B',
    glow: 'rgba(139,90,43,.35)',
  },
};

