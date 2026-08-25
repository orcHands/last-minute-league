export interface FutureSeasonTeam {
  managerId: string
  teamName: string
}

export interface FutureSeasonDivision {
  name: "Brian O'Connor Memorial Division" | 'Toretto Family Division'
  teams: FutureSeasonTeam[]
}

export interface FutureDraftPick extends FutureSeasonTeam {
  slot: number
  keeper: string | null
}

export interface FutureDraftRound {
  round: number
  picks: FutureDraftPick[]
}

export interface FutureBowlSite {
  name: string
  role: string
  venue: string
  city: string
  state: string
}

const TEAM_NAMES: Record<string, string> = {
  pb: 'Toyotathon',
  tommy: 'Kenosha Kickers',
  brice: 'Tua Fault',
  whitaker: 'The Caleb Will-Wins',
  jason: 'Et tu, Boutte?',
  alex: 'Coffin Floppers',
  megan: 'Tiny Panthers',
  ryan: 'The Kittle Prince',
  zac: 'Goffsides',
  carter: 'Arc the Ladd McConkey',
  kevin: 'The Princess McBride',
  michael: 'The Fumblers',
}

const team = (managerId: string): FutureSeasonTeam => ({ managerId, teamName: TEAM_NAMES[managerId] })

// The Week 1 league screenshot groups the six matchups by division. Brice's
// documented permanent O'Connor assignment anchors the first group.
export const FUTURE_SEASON_DIVISIONS: FutureSeasonDivision[] = [
  {
    name: "Brian O'Connor Memorial Division",
    teams: ['pb', 'tommy', 'brice', 'whitaker', 'jason', 'alex'].map(team),
  },
  {
    name: 'Toretto Family Division',
    teams: ['megan', 'ryan', 'zac', 'carter', 'kevin', 'michael'].map(team),
  },
]

const ODD_ORDER = ['tommy', 'megan', 'whitaker', 'zac', 'ryan', 'jason', 'brice', 'michael', 'carter', 'alex', 'pb', 'kevin']
const EVEN_ORDER = [...ODD_ORDER].reverse()

const ROUND_OVERRIDES: Record<number, string[]> = {
  // Toyotathon's fifth-round pick moved to Goffsides.
  5: ['tommy', 'megan', 'whitaker', 'zac', 'ryan', 'jason', 'brice', 'michael', 'carter', 'alex', 'zac', 'kevin'],
  // Goffsides' eighth-round pick moved to Toyotathon.
  8: ['kevin', 'pb', 'alex', 'carter', 'michael', 'brice', 'jason', 'ryan', 'pb', 'whitaker', 'megan', 'tommy'],
}

const KEEPERS: Record<string, string> = {
  '1.5': 'Jonathan Taylor',
  '1.12': 'Josh Jacobs',
  '2.7': 'Terry McLaurin',
  '5.3': 'Dak Prescott',
  '5.5': 'Chris Olave',
  '6.6': 'Jaylen Warren',
  '7.6': 'Jared Goff',
  '8.1': 'Caleb Williams',
  '8.2': 'Cam Skattebo',
  '9.1': 'Javonte Williams',
  '11.2': 'Rico Dowdle',
  '11.9': "Wan'Dale Robinson",
  '11.10': 'Kenny Gainwell',
  '12.2': 'Colston Loveland',
  '12.3': 'Kyle Monangai',
  '12.4': 'Jaxson Dart',
  '12.5': 'Trevor Lawrence',
  '12.11': 'Christian Watson',
  '12.12': 'Matthew Stafford',
  '14.6': 'Kyle Pitts Sr.',
}

export const FUTURE_SEASON_DRAFT: FutureDraftRound[] = Array.from({ length: 15 }, (_, index) => {
  const round = index + 1
  const order = ROUND_OVERRIDES[round] ?? (round % 2 === 1 ? ODD_ORDER : EVEN_ORDER)
  return {
    round,
    picks: order.map((managerId, pickIndex) => ({
      ...team(managerId),
      slot: pickIndex + 1,
      keeper: KEEPERS[`${round}.${pickIndex + 1}`] ?? null,
    })),
  }
})

export const FUTURE_SEASON_BOWLS: FutureBowlSite[] = [
  {
    name: 'Teremana Tequila Bowl',
    role: 'Championship',
    venue: 'Allegiant Stadium',
    city: 'Paradise',
    state: 'Nevada',
  },
  {
    name: 'Kumho Tires Tokyo Drift Bowl',
    role: 'Third place',
    venue: 'Tokyo Dome',
    city: 'Tokyo',
    state: 'Japan',
  },
  {
    name: 'Ludacris Presents the Magic City Lemon Pepper Wing Bowl',
    role: 'Consolation',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    state: 'Georgia',
  },
  {
    name: 'Voltron Global Bowl Hosted by Tyrese Gibson',
    role: 'Ninth place',
    venue: 'Hammond Central High School',
    city: 'Hammond',
    state: 'Indiana',
  },
]

export const FUTURE_SEASON = {
  year: 2026,
  status: 'upcoming' as const,
  featuredBowl: FUTURE_SEASON_BOWLS[0],
  divisions: FUTURE_SEASON_DIVISIONS,
  draft: FUTURE_SEASON_DRAFT,
  bowls: FUTURE_SEASON_BOWLS,
}
