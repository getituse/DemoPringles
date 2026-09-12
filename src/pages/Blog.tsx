import { ArrowRightIcon } from '@/components/icons';
import {
  StubShell,
  StubEyebrow,
  StubHeadline,
} from '@/components/Stub';
import { usePageFocus } from '@/hooks/usePageFocus';

const POSTS = [
  {
    date: 'Mar 12, 2026',
    title: 'Why wavy crisps crunch louder',
    excerpt:
      'Deeper ridges trap more air â€” and more seasoning. The physics of the perfect pop.',
  },
  {
    date: 'Feb 28, 2026',
    title: 'Seven flavors, one iconic can',
    excerpt:
      'From Fire Roasted JalapeÃ±o to Steak: a tour of the full Wavy lineup.',
  },
  {
    date: 'Feb 10, 2026',
    title: 'The science of the perfect stack',
    excerpt:
      'Hyperbolic paraboloids, uniform pressure, and why the tube matters.',
  },
] as const;

/** Blog stub. */
export default function Blog() {
  const h1Ref = usePageFocus<HTMLHeadingElement>();

  return (
    <StubShell>
      <StubEyebrow>The Crunch Chronicles</StubEyebrow>
      <StubHeadline headingRef={h1Ref}>Fresh from the can.</StubHeadline>

      <ul className="mt-12 max-w-[760px]">
        {POSTS.map((post) => (
          <li key={post.title} className="border-t border-[var(--hairline)] last:border-b">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-disabled="true"
              title="Coming soon"
              className="group relative flex items-center gap-6 overflow-hidden px-2 py-7"
            >
              {/* flavor-soft wipe on hover */}
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-[var(--flavor-soft)] transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
              <span className="relative z-10 w-28 shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--brand-orange)]">
                {post.date}
              </span>
              <span className="relative z-10 flex-1 transition-transform duration-300 group-hover:translate-x-2">
                <span className="block font-display text-2xl font-extrabold text-ink">
                  {post.title}
                </span>
                <span className="mt-1 block truncate text-sm font-normal text-gray-wavy">
                  {post.excerpt}
                </span>
              </span>
              <ArrowRightIcon className="relative z-10 shrink-0 text-ink transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
          </li>
        ))}
      </ul>
    </StubShell>
  );
}

