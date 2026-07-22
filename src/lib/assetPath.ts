/** Prefixes a public-folder path with Vite's base path so images resolve under a subpath deploy (e.g. GitHub Pages). */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
