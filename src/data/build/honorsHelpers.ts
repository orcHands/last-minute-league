import honors from '../processed/honors.json'
import { normalizeManager, type ManagerId } from '../managerCanon'

interface PodiumEntry {
  place: number
  team: string
  manager: string
  trophy: string
}

interface DivisionTeam {
  team: string
  manager: string
  division_wlt: string
  overall_wlt: string
}

interface DivisionBlock {
  canonical_name: string
  teams: DivisionTeam[]
}

interface SeasonHonors {
  podium: PodiumEntry[]
  division_winners: unknown[]
  consolation_winner: { winner: { place: number; team: string; manager: string } }
  points_leader: { team: string; manager: string; pf: number; award: string }
  divisions: Record<string, DivisionBlock>
  projections: unknown[]
  championship: unknown
  third_place_game: { winner: { team: string; manager: string }; runner_up: { manager: string } }
  ninth_place_game?: { winner: { manager: string }; runner_up: { manager: string } }
}

interface HonorsFile {
  _notes: unknown
  career: unknown
  future_hosts: unknown
  seasons: Record<string, SeasonHonors>
}

const honorsData = honors as unknown as HonorsFile

export function honorsSeasons(): Record<string, SeasonHonors> {
  return honorsData.seasons
}

/** Count of place-1 podium finishes per manager, across every season. */
export function buildChampionshipCounts(): Map<ManagerId, number> {
  const counts = new Map<ManagerId, number>()
  for (const season of Object.values(honorsData.seasons)) {
    const champion = season.podium.find(p => p.place === 1)
    if (!champion) continue
    const id = normalizeManager(champion.manager)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}
