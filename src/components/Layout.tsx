import { Outlet, useLocation } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Shared layout â€” nested-route (layout-route) pattern.
 * Header lives in normal document flow (no sticky/offset bookkeeping).
 * Footer renders on stub pages only.
 */
export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </div>
  );
}

