import { getManager, FRANCHISES, type Franchise } from './managers'
import { getSeasonDetail, SEASON_DETAIL_YEARS } from './seasonDetail'
import type { ManagerId } from '../managerCanon'
import { withBase } from '../../lib/assetPath'

export interface FranchiseRecordSplit {
  w: number
  l: number
  t: number
}

export interface FranchiseHomeVenue {
  stadium: string
  city: string
  state: string
  capacity: number
}

export interface FranchiseDetail {
  franchise: Franchise
  featuredManagerId: string
  yearsActive: number[]
  regularSeasonRecord: FranchiseRecordSplit
  playoffRecord: FranchiseRecordSplit
  homeVenue: FranchiseHomeVenue
  championshipYears: number[]
  divisionTitleYears: number[]
  tagline: string
  headerImage: string | null
  headerPosition: string
  originalThree: boolean
}

// Current/final home venue canon, keyed only by canonical manager id so no
// display-name strings leak into this layer. This is the public subset of the
// local season-detail stadium canon needed by franchise headers.
const HOME_VENUES: Record<ManagerId, FranchiseHomeVenue> = {
  jay: { stadium: 'Lane Stadium', city: 'Blacksburg', state: 'VA', capacity: 65632 },
  brice: { stadium: 'Hard Rock Stadium', city: 'Miami', state: 'FL', capacity: 65326 },
  zac: { stadium: 'Soldier Field', city: 'Chicago', state: 'IL', capacity: 61500 },
  pb: { stadium: 'Stade Olympique', city: 'Montréal', state: 'QC', capacity: 56040 },
  whitaker: { stadium: 'Memorial Stadium', city: 'Bloomington', state: 'IN', capacity: 52626 },
  michael: { stadium: 'Cotton Bowl', city: 'Dallas', state: 'TX', capacity: 92100 },
  ryan: { stadium: "Levi's Stadium", city: 'Santa Clara', state: 'CA', capacity: 68500 },
  tommy: { stadium: 'AT&T Stadium', city: 'Arlington', state: 'TX', capacity: 80000 },
  carter: { stadium: 'Jones AT&T Stadium', city: 'Lubbock', state: 'TX', capacity: 60454 },
  kevin: { stadium: 'Acrisure Stadium', city: 'Pittsburgh', state: 'PA', capacity: 68400 },
  benedict: { stadium: 'Gillette Stadium', city: 'Foxborough', state: 'MA', capacity: 65878 },
  laskey: { stadium: 'Tottenham Hotspur Stadium', city: 'London', state: 'UK', capacity: 62850 },
  sara: { stadium: 'Neyland Stadium', city: 'Knoxville', state: 'TN', capacity: 101915 },
  jason: { stadium: 'Oakland Coliseum', city: 'Oakland', state: 'CA', capacity: 63132 },
  dylan: { stadium: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', capacity: 82500 },
  becca: { stadium: 'Lucas Oil Stadium', city: 'Indianapolis', state: 'IN', capacity: 67000 },
  megan: { stadium: 'SoFi Stadium', city: 'Inglewood', state: 'CA', capacity: 70240 },
  aboubacar: { stadium: 'DKR-Texas Memorial Stadium', city: 'Austin', state: 'TX', capacity: 100119 },
  kat: { stadium: 'Autzen Stadium', city: 'Eugene', state: 'OR', capacity: 54000 },
  alex: { stadium: 'Caesars Superdome', city: 'New Orleans', state: 'LA', capacity: 73208 },
  dave: { stadium: 'Memorial Stadium', city: 'Champaign', state: 'IL', capacity: 60670 },
  kelly: { stadium: 'Michigan Stadium', city: 'Ann Arbor', state: 'MI', capacity: 107601 },
  kyle: { stadium: 'Raymond James Stadium', city: 'Tampa', state: 'FL', capacity: 65618 },
}

function managersForSeason(franchise: Franchise, year: number): Set<string> {
  return new Set(
    franchise.managerStints
      .filter(stint => stint.seasons.includes(year))
      .map(stint => stint.managerId),
  )
}

const FRANCHISE_TAGLINES: Record<string, string> = {
  carter: 'An Original 3 franchise that is also a perennial threat to win year after year.',
  'dave-lang': 'A statistical abberation thanks to 2013. Die young and leave a beautiful corpse.',
  zac: 'The lows are low, but the highs are very high.',
  whitaker: 'The only Original 3 franchise to never win a title. But hope springs eternal.',
  tommy: 'A frequent dark horse for the title.',
  jay: 'The most decorated franchise in league history.',
  brice: 'All Hail our Lord Commissioner.',
  pb: 'God of the Waiver Wire.',
  ryan: "I've seen him lose. I've seen him win. I've never seen him quit.",
  benedict: 'A once proud franchise back on track to the top under new management.',
  michael: 'No rain, no rainbows.',
  laskey: 'A frequent doormat turned frequent contender.',
  'kelly-brown': 'Perfect in every possible way. Zero notes.',
  dylan: 'In two short seasons has already claimed the mantle of "Manager with the best winning percentage."',
  kyle: 'Look, I get him and Dylan confused sometimes, OK?',
}

function franchiseTagline(franchise: Franchise): string {
  return FRANCHISE_TAGLINES[franchise.id] ?? 'A resilient franchise with its best football ahead.'
}

function buildPlayoffRecord(franchise: Franchise): FranchiseRecordSplit {
  const record: FranchiseRecordSplit = { w: 0, l: 0, t: 0 }

  for (const year of SEASON_DETAIL_YEARS) {
    const managerIds = managersForSeason(franchise, year)
    if (managerIds.size === 0) continue

    const detail = getSeasonDetail(year)
    if (!detail) continue

    const games = [detail.championsBracket, detail.consolationBracket]
      .flatMap(bracket => bracket.rounds)
      .flatMap(round => round.entries)
      .filter(entry => entry.kind === 'game')

    for (const game of games) {
      const franchiseIsTeamOne = !!game.m1 && managerIds.has(game.m1)
      const franchiseIsTeamTwo = !!game.m2 && managerIds.has(game.m2)
      if (!franchiseIsTeamOne && !franchiseIsTeamTwo) continue
      if (game.s1 === undefined || game.s2 === undefined) continue

      const franchiseScore = franchiseIsTeamOne ? game.s1 : game.s2
      const opponentScore = franchiseIsTeamOne ? game.s2 : game.s1
      if (franchiseScore > opponentScore) record.w += 1
      else if (franchiseScore < opponentScore) record.l += 1
      else record.t += 1
    }
  }

  return record
}

function buildDetail(franchise: Franchise): FranchiseDetail | null {
  const featuredManagerId = franchise.managers[franchise.managers.length - 1]
  const featuredManager = getManager(featuredManagerId)
  const homeVenue = HOME_VENUES[featuredManagerId as ManagerId]
  if (!featuredManager || !homeVenue) return null

  const yearsActive = [...new Set(
    franchise.managerStints.flatMap(stint => stint.seasons),
  )].sort((a, b) => a - b)

  return {
    franchise,
    featuredManagerId,
    yearsActive,
    regularSeasonRecord: franchise.allTimeRecord,
    playoffRecord: buildPlayoffRecord(franchise),
    homeVenue,
    championshipYears: franchise.championshipYears,
    divisionTitleYears: franchise.divisionTitleYears,
    tagline: franchiseTagline(franchise),
    headerImage: withBase(`images/franchise_backgrounds/${franchise.id}.jpg`),
    headerPosition: franchise.id === 'brice'
      ? 'center 14%'
      : franchise.id === 'whitaker'
        ? 'center 58%'
        : 'center',
    originalThree: ['brice', 'carter', 'whitaker'].includes(franchise.id),
  }
}

const FRANCHISE_DETAILS = new Map(
  FRANCHISES.flatMap(franchise => {
    const detail = buildDetail(franchise)
    return detail ? [[franchise.id, detail] as const] : []
  }),
)

export function getFranchiseDetail(id: string): FranchiseDetail | undefined {
  return FRANCHISE_DETAILS.get(id)
}
