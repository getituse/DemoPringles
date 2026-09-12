import { Link } from 'react-router';
import { CircularArrowIcon } from '@/components/icons';
import {
  StubShell,
  StubEyebrow,
  StubHeadline,
  StubDecor,
} from '@/components/Stub';
import { usePageFocus } from '@/hooks/usePageFocus';

/** About stub. */
export default function About() {
  const h1Ref = usePageFocus<HTMLHeadingElement>();

  return (
    <StubShell>
      <StubDecor />
      <StubEyebrow>Our Story</StubEyebrow>
      <StubHeadline headingRef={h1Ref}>
        Stacked with flavor since day one.
      </StubHeadline>

      <div className="mt-8 max-w-[60ch] space-y-5 text-[15px] font-normal leading-[1.7] text-gray-wavy">
        <p>
          Pringles Wavy started with a simple question: what if the world's
          most stackable crisp had a bigger crunch? Deeper ridges, bolder
          seasoning, and that unmistakable can â€” reimagined for snackers who
          want every wave to pop with flavor.
        </p>
        <p>
          Seven flavors, one legendary tube, and a crunch you can hear from
          across the room.
        </p>
      </div>

      <Link
        to="/products"
        className="group mt-10 inline-flex h-14 items-center justify-between gap-4 rounded-[14px] bg-[var(--flavor-cta)] pl-7 pr-3 text-[15px] font-medium text-white shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-[3px] hover:bg-[var(--flavor-cta-hover)] hover:shadow-[var(--shadow-hover),0_0_0_6px_var(--flavor-glow)] active:scale-[0.97]"
      >
        Explore the Flavors
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/[0.12] transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-90">
          <CircularArrowIcon />
        </span>
      </Link>
    </StubShell>
  );
}

