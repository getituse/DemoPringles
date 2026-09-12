import { useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import gsap from 'gsap';
import { MagnifierIcon, BasketIcon } from '@/components/icons';
import { assetUrl } from '@/lib/asset';

/**
 * Global header.
 * Transparent over ivory on home; `--hairline` bottom border on stub pages.
 * In normal document flow (reference shows no sticky header â€” it scrolls away).
 */

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products', badge: true },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
] as const;

function NavItem({
  to,
  label,
  badge,
  onClick,
  className = '',
}: {
  to: string;
  label: string;
  badge?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`group relative py-1 text-[15px] font-medium tracking-[0.01em] text-ink ${className}`}
    >
      {label}
      {badge && (
        <span
          aria-hidden
          className="animate-wavy-bob absolute -top-4 -right-3.5 flex h-6 items-center rounded-full bg-[var(--brand-orange)] px-2 text-[11px] font-semibold text-white transition-transform duration-300 group-hover:scale-[1.12]"
        >
          new
        </span>
      )}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 right-0 h-[2px] origin-center scale-x-0 bg-[var(--ink)] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </NavLink>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const headerRef = useRef<HTMLElement>(null);

  // First-load entrance: children slide down + fade, staggered.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-header-item]', {
        y: -16,
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.07,
        delay: 0.2,
        // restore Tailwind's translate-centering (nav) once settled
        clearProps: 'transform,opacity',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className={`relative z-50 flex h-[104px] items-center justify-between px-[clamp(20px,5vw,72px)] ${
        isHome ? '' : 'border-b border-[var(--hairline)]'
      }`}
    >
      {/* Logo */}
      <Link to="/" aria-label="Pringles Wavy — home" className="shrink-0" data-header-item>
        <img
          src={assetUrl('/logo-pringles.png')}
          alt="Pringles"
          className="w-[92px] max-w-none object-contain"
          width={92}
          height={92}
        />
      </Link>

      {/* Center nav (absolutely centered per reference) */}
      <nav
        aria-label="Primary"
        data-header-item
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-14 min-[900px]:flex"
      >
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>

      {/* Right cluster: search + cart */}
      <div className="flex items-center gap-5" data-header-item>
        <label className="hidden h-[52px] w-[260px] items-center gap-3 rounded-full bg-white pl-[18px] pr-5 shadow-[var(--shadow-soft)] transition-all duration-300 focus-within:w-[284px] focus-within:shadow-[0_0_0_3px_var(--flavor-glow),0_10px_30px_rgba(0,0,0,0.12)] md:flex">
          <MagnifierIcon className="shrink-0 text-[var(--gray)]" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="w-full bg-transparent text-sm font-normal text-ink placeholder:text-[var(--gray)] focus:outline-none"
          />
        </label>

        <button
          type="button"
          aria-label="Basket, 1 item"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full text-ink"
        >
          <span className="transition-transform duration-300 group-hover:-rotate-[8deg]">
            <BasketIcon />
          </span>
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--brand-orange)] text-[10px] font-semibold text-white transition-transform duration-200 group-hover:scale-[1.18]"
          >
            1
          </span>
        </button>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-12 w-12 flex-col items-center justify-center gap-1.5 min-[900px]:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-[var(--ink)] transition-transform duration-300 ${
              menuOpen ? 'translate-y-[8px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-[var(--ink)] transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-[var(--ink)] transition-transform duration-300 ${
              menuOpen ? '-translate-y-[8px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile full-screen overlay menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-ivory transition-opacity duration-300 min-[900px]:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link, i) => (
          <div
            key={link.to}
            className={`transition-all duration-500 ${
              menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
          >
            <NavItem
              {...link}
              onClick={() => setMenuOpen(false)}
              className="text-2xl"
            />
          </div>
        ))}
        <label
          className={`mt-4 flex h-[52px] w-[min(320px,80vw)] items-center gap-3 rounded-full bg-white pl-[18px] pr-5 shadow-[var(--shadow-soft)] transition-all duration-500 ${
            menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: menuOpen ? `${NAV_LINKS.length * 60}ms` : '0ms' }}
        >
          <MagnifierIcon className="shrink-0 text-[var(--gray)]" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="w-full bg-transparent text-sm text-ink placeholder:text-[var(--gray)] focus:outline-none"
          />
        </label>
      </div>
    </header>
  );
}

