import { normalizeManager } from '../managerCanon'
import { honorsSeasons } from './honorsHelpers'

export interface Season {
  year: number
  asterisk: boolean
  asteriskReason?: string
  champion: string
  championTeam: string
  runnerUp: string
  runnerUpTeam: string
  pointsLeader: string
  pointsLeaderPF: number
  pointsLeaderTeam: string
  thirdPlace: string
  thirdPlaceTeam: string
  consolation: string
  consolationTeam: string
  ninthPlace?: string
  lettyWinner: string
}

// League canon, not derivable from any processed field.
const ASTERISKS: Record<number, string> = {
  2013: 'Half-season — started NFL week 7',
  2020: 'COVID "bubble" season — unique scheduling and shortened playoffs',
}

const seasonsHonors = honorsSeasons()

export const SEASONS: Season[] = Object.entries(seasonsHonors)
  .map(([yearStr, s]) => {
    const year = Number(yearStr)
    const champion = s.podium.find(p => p.place === 1)
    const runnerUp = s.podium.find(p => p.place === 2)
    const asteriskReason = ASTERISKS[year]

    return {
      year,
      asterisk: !!asteriskReason,
      asteriskReason,
      champion: champion ? normalizeManager(champion.manager) : '',
      championTeam: champion?.team ?? '',
      runnerUp: runnerUp ? normalizeManager(runnerUp.manager) : '',
      runnerUpTeam: runnerUp?.team ?? '',
      pointsLeader: normalizeManager(s.points_leader.manager),
      pointsLeaderPF: s.points_leader.pf,
      pointsLeaderTeam: s.points_leader.team,
      thirdPlace: normalizeManager(s.third_place_game.winner.manager),
      thirdPlaceTeam: s.third_place_game.winner.team,
      consolation: normalizeManager(s.consolation_winner.winner.manager),
      consolationTeam: s.consolation_winner.winner.team,
      ninthPlace: s.ninth_place_game ? normalizeManager(s.ninth_place_game.winner.manager) : undefined,
      lettyWinner: normalizeManager(s.points_leader.manager),
    }
  })
  .sort((a, b) => a.year - b.year)
