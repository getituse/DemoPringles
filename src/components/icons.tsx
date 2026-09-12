/**
 * Hand-coded inline SVG icon set.
 * All stroke `currentColor`, stroke-width 2, stroke-linecap round.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function MagnifierIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

export function BasketIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...base} {...props}>
      <path d="M4 9h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 9Z" />
      <path d="M8.5 9 12 3.5 15.5 9" />
      <path d="M9.5 13v3.5M14.5 13v3.5" />
    </svg>
  );
}

export function WaveLinesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...base} {...props}>
      <path pathLength={1} d="M3 6c2.5-2 5-2 7.5 0s5 2 7.5 0 3-1.6 3 0" />
      <path pathLength={1} d="M3 12c2.5-2 5-2 7.5 0s5 2 7.5 0 3-1.6 3 0" />
      <path pathLength={1} d="M3 18c2.5-2 5-2 7.5 0s5 2 7.5 0 3-1.6 3 0" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...base} {...props}>
      <path pathLength={1} d="M12 20s-7.5-4.6-9-9.3C2 7.4 4 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3.2 0 5.2 2.9 4.2 6.2-1.5 4.7-9 9.3-9 9.3Z" />
    </svg>
  );
}

export function FeatherIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...base} {...props}>
      <path pathLength={1} d="M20 4c-5 0-11 2-13.5 8.5C5 16 5 19 5 19s3 0 6.5-1.5C18 15 20 9 20 4Z" />
      <path pathLength={1} d="M5 19C8 15 12 10 17 7" />
    </svg>
  );
}

export function CircularArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...base} {...props}>
      <path d="M4 12h13" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Eyebrow mark â€” chip with waves */
export function SquiggleMark(props: IconProps) {
  return (
    <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden {...base} {...props}>
      <path d="M2 13c2-6 6-9 10-9 5 0 9 3 10 8-2 3-6 5-10 5-4 0-8-1.5-10-4Z" />
      <path d="M7 10c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 2.5-1 3 0" />
      <path d="M8 14c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...base} {...props}>
      <path d="M4 12h16" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export function EnvelopeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function XSocialIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="currentColor" {...props}>
      <path d="M17.7 3H21l-7.1 8.1L22.2 21h-6.6l-5.1-6.1L4.6 21H1.3l7.6-8.7L1.5 3h6.7l4.6 5.6L17.7 3Zm-1.2 16h1.8L7 4.9H5L16.5 19Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="currentColor" {...props}>
      <path d="M16.8 3c.3 2 1.6 3.6 3.9 3.9v3c-1.5 0-2.8-.4-3.9-1.2v6.5c0 3.5-2.5 5.8-5.7 5.8-3 0-5.4-2.2-5.4-5.2 0-3.1 2.6-5.3 5.9-5.1l.4 3a2.3 2.3 0 0 0-2.5 2.1c0 1.3 1 2.2 2.3 2.2 1.4 0 2.4-1 2.4-2.7V3h2.6Z" />
    </svg>
  );
}

