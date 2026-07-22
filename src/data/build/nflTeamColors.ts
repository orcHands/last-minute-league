// Approximate NFL primary colors for the fandom/rostering color swatches.
// Not league canon — just enough to render a distinct, recognizable chip.
// Falls back to Carbon gray for any unmapped / historical abbreviation.
export const NFL_TEAM_COLORS: Record<string, string> = {
  Cardinals: '#97233F', ARZ: '#97233F',
  Falcons: '#A71930',
  Ravens: '#241773',
  Bills: '#00338D',
  Panthers: '#0085CA',
  Bears: '#0B162A',
  Bengals: '#FB4F14',
  Browns: '#311D00',
  Cowboys: '#003594',
  Broncos: '#FB4F14',
  Lions: '#0076B6',
  Packers: '#203731',
  Texans: '#03202F',
  Colts: '#002C5F',
  Jaguars: '#006778',
  Chiefs: '#E31837',
  Raiders: '#000000', OAK: '#000000',
  Chargers: '#0080C6', SD: '#0080C6',
  Rams: '#003594', SL: '#003594', STL: '#003594',
  Dolphins: '#008E97',
  Vikings: '#4F2683',
  Patriots: '#002244',
  Saints: '#D3BC8D',
  Giants: '#0B2265',
  Jets: '#125740',
  Eagles: '#004C54',
  Steelers: '#FFB612',
  '49ers': '#AA0000',
  Seahawks: '#002244',
  Buccaneers: '#D50A0A',
  Titans: '#4B92DB',
  Commanders: '#5A1414', Redskins: '#5A1414', WSH: '#5A1414', Washington: '#5A1414',
}

export function nflTeamColor(team: string): string {
  return NFL_TEAM_COLORS[team] ?? '#8d8d8d'
}
