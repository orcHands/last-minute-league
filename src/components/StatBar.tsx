import { LEAGUE_STATS } from '../data/league'

// Carbon-palette rainbow, left to right across the bar. Each tile's accent
// reads as a top rule, matching the divider colors elsewhere in the app.
const TILES: { label: string; value: string; accent: string }[] = [
  { label: 'Seasons', value: String(LEAGUE_STATS.seasons), accent: '#da1e28' },
  { label: 'Franchises', value: String(LEAGUE_STATS.franchises), accent: '#ff832b' },
  { label: 'Managers', value: String(LEAGUE_STATS.managers), accent: '#f1c21b' },
  {
    label: 'Games played',
    value: LEAGUE_STATS.gamesPlayed.toLocaleString('en-US'),
    accent: '#42be65',
  },
  {
    label: 'Points scored',
    value: LEAGUE_STATS.pointsScored.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    accent: '#1192e8',
  },
  {
    label: 'Players rostered',
    value: LEAGUE_STATS.playersRostered.toLocaleString('en-US'),
    accent: '#0f62fe',
  },
  { label: 'Fast & Furious films', value: String(LEAGUE_STATS.fastFuriousFilms), accent: '#ee5396' },
]

export default function StatBar() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        backgroundColor: '#393939',
        border: '1px solid #393939',
      }}
    >
      {TILES.map(tile => (
        <div
          key={tile.label}
          style={{
            backgroundColor: '#262626',
            borderTop: `3px solid ${tile.accent}`,
            padding: '16px 20px 18px',
            flex: '1 1 auto',
            minWidth: 132,
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: 11,
              lineHeight: '16px',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#8d8d8d',
              marginBottom: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {tile.label}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 300,
              fontSize: 'clamp(28px, 3vw, 40px)',
              lineHeight: 1.1,
              color: '#f4f4f4',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {tile.value}
          </div>
        </div>
      ))}
    </div>
  )
}
