// Local, manually-sourced winner photos -- replaces the old ESPN hotlink
// approach entirely (2026-08-23 feedback pass). Hoss downloads a photo per
// the manifest delivered alongside this build and drops it at the path
// below; until then AssetImage's onError fallback renders instead of a
// broken image, same convention as every other asset slot on this site.
import { withBase } from '../lib/assetPath'

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

/** tieIndex: undefined = sole winner, 0/1 = co-winner A/B (rank-1 tie). */
export function awardWinnerPhotoUrl(year: number, awardKey: string, tieIndex?: number): string {
  const suffix = tieIndex === undefined ? '' : `_${String.fromCharCode(97 + tieIndex)}`
  return withBase(`images/season_awards/${year}/${awardKey}${suffix}.png`)
}

export function bowlMvpPhotoUrl(year: number, bowlKey: string): string {
  return withBase(`images/season_awards/${year}/bowl_${slugify(bowlKey)}.png`)
}
