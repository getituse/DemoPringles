import { Link } from 'react-router';
import {
  EnvelopeIcon,
  XSocialIcon,
  InstagramIcon,
  TikTokIcon,
} from '@/components/icons';
import {
  StubShell,
  StubEyebrow,
  StubHeadline,
} from '@/components/Stub';
import { usePageFocus } from '@/hooks/usePageFocus';

/** Contact stub. */
export default function Contact() {
  const h1Ref = usePageFocus<HTMLHeadingElement>();

  return (
    <StubShell>
      <div className="flex flex-col items-center text-center">
        <StubEyebrow>Say Hello</StubEyebrow>
        <StubHeadline headingRef={h1Ref}>Talk crisps with us.</StubHeadline>

        <div className="mt-10 w-full max-w-[560px] rounded-3xl bg-white p-12 shadow-[var(--shadow-lift)]">
          {/* email row */}
          <a
            href="mailto:hello@wavy.example"
            className="group flex items-center gap-4 text-left"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[var(--flavor-main)] shadow-[var(--shadow-soft)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_0_6px_var(--flavor-glow)]">
              <EnvelopeIcon />
            </span>
            <span className="text-base font-medium text-ink">
              hello@wavy.example
            </span>
          </a>

          {/* social row */}
          <div className="mt-8 flex items-center gap-4">
            {[
              { Icon: XSocialIcon, label: 'X (Twitter)' },
              { Icon: InstagramIcon, label: 'Instagram' },
              { Icon: TikTokIcon, label: 'TikTok' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_6px_var(--flavor-glow)]"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="mt-10 inline-flex h-14 items-center rounded-full border-2 border-[var(--flavor-main)] px-8 text-[15px] font-medium text-[var(--flavor-main)] transition-colors duration-300 hover:bg-[var(--flavor-main)] hover:text-white"
        >
          Back to the Can
        </Link>
      </div>
    </StubShell>
  );
}

