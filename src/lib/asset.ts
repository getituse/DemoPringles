/**
 * Resolves a public asset path against Vite's configured base URL.
 * Works seamlessly across local development, custom domains, and subpaths (e.g. GitHub Pages /DemoPringles/).
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === './' || base === '.') {
    const cleanPath = path.replace(/^\/+/, '');
    return `./${cleanPath}`;
  }
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
