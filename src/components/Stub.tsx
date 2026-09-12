/**
 * Shared stub-page scaffolding.
 * Ivory bg, content max-width 880px centered, padding-top 80px under header.
 */

export function StubShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-[calc(100dvh-104px-64px)] w-full max-w-[880px] px-6 pb-24 pt-20">
      {children}
    </div>
  );
}

export function StubEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.04em] text-[var(--brand-orange)]">
      <svg
        viewBox="0 0 28 20"
        width="28"
        height="20"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M2 13c2-6 6-9 10-9 5 0 9 3 10 8-2 3-6 5-10 5-4 0-8-1.5-10-4Z" />
        <path d="M7 10c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 2.5-1 3 0" />
      </svg>
      {children}
    </p>
  );
}

export function StubHeadline({
  children,
  headingRef,
}: {
  children: React.ReactNode;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="animate-copy-in mt-6 font-display text-[clamp(36px,5vw,56px)] font-black leading-[1.08] tracking-[-0.01em] text-ink focus:outline-none"
    >
      {children}
    </h1>
  );
}

export function StubDecor() {
  return (
    <>
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        aria-hidden
        className="pointer-events-none absolute -left-10 top-16 opacity-50"
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
        />
      </svg>
      <svg
        width="70"
        height="48"
        viewBox="0 0 70 48"
        aria-hidden
        className="pointer-events-none absolute -right-4 bottom-24 opacity-50"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={4 + (i % 4) * 18}
            cy={4 + Math.floor(i / 4) * 16}
            r="3"
            fill="var(--gray-soft)"
          />
        ))}
      </svg>
    </>
  );
}

