import { useNavigate } from 'react-router';
import { useFlavor } from '@/theme/useFlavorTheme';
import { FLAVOR_LIST } from '@/data/flavors';
import type { FlavorId } from '@/data/flavors';
import { THEMES } from '@/theme/themes';
import {
  StubShell,
  StubEyebrow,
  StubHeadline,
} from '@/components/Stub';
import { usePageFocus } from '@/hooks/usePageFocus';

/**
 * Products stub â€” 7-flavor grid, doubles as a flavor index.
 * Click: setFlavor(id) through the master var-tween, then route home after
 * 400ms so the user lands mid-transition.
 */
export default function Products() {
  const h1Ref = usePageFocus<HTMLHeadingElement>();
  const { flavor, setFlavor } = useFlavor();
  const navigate = useNavigate();

  const pick = (id: FlavorId) => {
    setFlavor(id);
    window.setTimeout(() => navigate(`/?flavor=${id}`), 400);
  };

  return (
    <StubShell>
      <StubEyebrow>The Lineup</StubEyebrow>
      <StubHeadline headingRef={h1Ref}>Every wave, every flavor.</StubHeadline>

      <ul className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {FLAVOR_LIST.map((f, i) => {
          const active = f.id === flavor;
          const tokens = THEMES[f.id];
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => pick(f.id)}
                aria-pressed={active}
                className="group relative flex h-full w-full flex-col items-start rounded-[20px] bg-white p-7 text-left shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-hover),0_0_0_6px_var(--flavor-glow)]"
                style={{
                  boxShadow: active
                    ? 'var(--shadow-soft), 0 0 0 2px var(--flavor-main)'
                    : undefined,
                }}
              >
                {active && (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--brand-orange)] px-2 py-0.5 text-[10px] font-semibold text-white">
                    selected
                  </span>
                )}
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12"
                  style={{
                    background: `linear-gradient(135deg, ${tokens.main}, ${tokens.circleB})`,
                  }}
                >
                  <img
                    src={f.labelTexture}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </span>
                <span className="mt-5 text-base font-semibold text-ink">
                  {f.name}
                </span>
                <span className="mt-1 text-[13px] font-normal leading-[1.45] text-gray-wavy">
                  {f.caption}
                </span>
                <span className="sr-only">{i + 1} of 7 flavors</span>
              </button>
            </li>
          );
        })}
      </ul>
    </StubShell>
  );
}

