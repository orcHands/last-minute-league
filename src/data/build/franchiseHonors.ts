import honorsJson from '../processed/honors.json'
import { bowlLogoUrl } from '../bowlAssets'
import { normalizeManager } from '../managerCanon'
import { withBase } from '../../lib/assetPath'
import { FRANCHISES } from './managers'
import { canonicalDivisionName, DIVISION_NAMES } from '../divisionCanon'

export type FranchiseHonorKind = 'bowl' | 'division' | 'letty'

export interface FranchiseHonor {
  id: string
  franchiseId: string
  managerId: string
  year: number
  kind: FranchiseHonorKind
  name: string
  logoPath: string | null
  seasonFlag: 'Half season' | 'COVID season' | null
}

interface Winner {
  manager: string
}

interface RawSeasonHonors {
  podium: Array<Winner & { place: number }>
  division_winners: Array<Winner & {
    canonical_division: string
    trophy: string
  }>
  consolation_winner: {
    name: string
    winner: Winner
  }
  points_leader: Winner & { award: string }
  championship: { name: string }
  third_place_game: {
    name: string
    winner: Winner
  }
  ninth_place_game?: {
    name: string
    winner: Winner
  }
}

interface HonorsFile {
  seasons: Record<string, RawSeasonHonors>
}

const honors = honorsJson as unknown as HonorsFile

const DIVISION_LOGOS: Record<string, string> = {
  [DIVISION_NAMES.oconnor]: withBase('images/BrianOConnerMemorialDivision_Logo.png'),
  [DIVISION_NAMES.toretto]: withBase('images/TorettoFamilyDivision_logo.png'),
}

const LETTY_LOGO = withBase('images/LettyAward_trophy.png')

function seasonFlag(year: number): FranchiseHonor['seasonFlag'] {
  if (year === 2013) return 'Half season'
  if (year === 2020) return 'COVID season'
  return null
}

function franchiseForManagerSeason(managerId: string, year: number): string | null {
  return FRANCHISES.find(franchise => franchise.managerStints.some(
    stint => stint.managerId === managerId && stint.seasons.includes(year),
  ))?.id ?? null
}

function honor(
  year: number,
  winner: Winner | undefined,
  kind: FranchiseHonorKind,
  name: string,
  logoPath: string | null,
): FranchiseHonor | null {
  if (!winner) return null
  const managerId = normalizeManager(winner.manager)
  const franchiseId = franchiseForManagerSeason(managerId, year)
  if (!franchiseId) return null

  return {
    id: `${franchiseId}-${year}-${kind}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    franchiseId,
    managerId,
    year,
    kind,
    name,
    logoPath,
    seasonFlag: seasonFlag(year),
  }
}

function buildFranchiseHonors(): FranchiseHonor[] {
  const result: FranchiseHonor[] = []

  for (const [yearText, season] of Object.entries(honors.seasons)) {
    const year = Number(yearText)
    const champion = season.podium.find(entry => entry.place === 1)
    const bowlHonors: Array<[Winner | undefined, string]> = [
      [champion, season.championship.name],
      [season.third_place_game.winner, season.third_place_game.name],
      [season.consolation_winner.winner, season.consolation_winner.name],
    ]
    if (season.ninth_place_game) {
      bowlHonors.push([season.ninth_place_game.winner, season.ninth_place_game.name])
    }

    for (const [winner, name] of bowlHonors) {
      const entry = honor(year, winner, 'bowl', name, bowlLogoUrl(name, year))
      if (entry) result.push(entry)
    }

    for (const winner of season.division_winners) {
      const divisionName = canonicalDivisionName(winner.canonical_division)
      const entry = honor(
        year,
        winner,
        'division',
        `${divisionName} Winner`,
        DIVISION_LOGOS[divisionName] ?? null,
      )
      if (entry) result.push(entry)
    }

    const letty = honor(
      year,
      season.points_leader,
      'letty',
      season.points_leader.award,
      LETTY_LOGO,
    )
    if (letty) result.push(letty)
  }

  return result.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name))
}

export const FRANCHISE_HONORS = buildFranchiseHonors()

export function getFranchiseHonors(franchiseId: string): FranchiseHonor[] {
  return FRANCHISE_HONORS.filter(entry => entry.franchiseId === franchiseId)
}
