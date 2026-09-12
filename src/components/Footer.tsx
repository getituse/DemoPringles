import { Link } from 'react-router';

/**
 * Minimal themed footer bar â€” stub pages only.
 */
export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-[clamp(20px,5vw,72px)] py-5 text-white"
      style={{ backgroundColor: 'var(--flavor-deep)' }}
    >
      <p className="text-xs font-normal">
        Â© 2026 Pringles Wavy. All rights reserved.
      </p>
      <Link
        to="/"
        className="text-xs font-normal text-white underline-offset-4 hover:underline"
      >
        Back to home â†‘
      </Link>
    </footer>
  );
}

