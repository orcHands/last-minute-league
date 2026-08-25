import ringJson from '../processed/franchise_ring_of_honor.json'
import { normalizeManager, type ManagerId } from '../managerCanon'
import { withBase } from '../../lib/assetPath'

export interface FranchiseRingOfHonorEntry {
  id: string
  franchiseId: string
  player: string
  uniformNumber: string
  draftedByManagerId: ManagerId
  draftSource: string
  gamesRostered: number | null
  franchiseStarts: number | null
  careerGamesPlayed: number | null
  ppg: number | null
  imagePath: string | null
  uniformTeams: string[]
}

interface RawEntry {
  player: string
  uniform_number: string
  drafted_by: string
  draft_source: string
  games_rostered: number | null
  franchise_starts: number | null
  career_games_played: number | null
  ppg: number | null
  image_file: string
  image_available: boolean
  uniform_teams: string[]
}

interface RingFile {
  franchises: Record<string, { honorees: RawEntry[] }>
}

const data = ringJson as unknown as RingFile

export const FRANCHISE_RING_OF_HONOR: FranchiseRingOfHonorEntry[] = Object.entries(data.franchises)
  .flatMap(([franchiseId, franchise]) => franchise.honorees.map(entry => ({
    id: `${franchiseId}-${entry.player.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    franchiseId,
    player: entry.player,
    uniformNumber: entry.uniform_number,
    draftedByManagerId: normalizeManager(entry.drafted_by),
    draftSource: entry.draft_source,
    gamesRostered: entry.games_rostered,
    franchiseStarts: entry.franchise_starts,
    careerGamesPlayed: entry.career_games_played,
    ppg: entry.ppg,
    imagePath: entry.image_available
      ? withBase(`images/player_portraits/${entry.image_file}`)
      : null,
    uniformTeams: entry.uniform_teams,
  })))

export function getFranchiseRingOfHonor(franchiseId: string): FranchiseRingOfHonorEntry[] {
  return FRANCHISE_RING_OF_HONOR.filter(entry => entry.franchiseId === franchiseId)
}
