import { useParams, Link } from 'react-router-dom'
import { getSeasonDetail, SEASON_DETAIL_YEARS } from '../data/league'
import BowlHeaderCard from '../components/BowlHeaderCard'
import SeasonDivisionStandings from '../components/SeasonDivisionStandings'
import SeasonBracket from '../components/SeasonBracket'
import SeasonAwardsGrid from '../components/SeasonAwardsGrid'
import AllDivisionTeams from '../components/AllDivisionTeams'

export default function SeasonDetailPage() {
  const { year: yearParam } = useParams<{ year: string }>()
  const year = Number(yearParam)
  const detail = getSeasonDetail(year)

  if (!detail) {
    return (
      <div style={{ backgroundColor: '#161616', minHeight: '100vh', padding: '48px 16px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 28, lineHeight: '36px', color: '#f4f4f4' }}>
            {yearParam} — detail not built yet
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d' }}>
            Only {SEASON_DETAIL_YEARS.join(', ') || 'no seasons'} currently {SEASON_DETAIL_YEARS.length === 1 ? 'has' : 'have'} a full season-detail page.
          </p>
          <Link to="/seasons" style={{ color: '#78a9ff', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 }}>← Back to Seasons</Link>
        </div>
      </div>
    )
  }

  // venue for named-bowl cards -- pull from whichever bracket's terminal entry matches this bowl
  const allTerminal = [...detail.championsBracket.rounds, ...detail.consolationBracket.rounds]
    .flatMap(r => r.entries)
    .filter(e => e.kind === 'game' && e.terminal)

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '32px 16px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <Link to="/seasons" style={{ color: '#78a9ff', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', textDecoration: 'none' }}>← Seasons</Link>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '8px 0 0' }}>
            {year} Season
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '32px 16px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {detail.bowls.map(bowl => {
              const match = allTerminal.find(e =>
                (e.m1 === bowl.winnerManager && e.m2 === bowl.loserManager) ||
                (e.m2 === bowl.winnerManager && e.m1 === bowl.loserManager)
              )
              const venue = match?.venue ? { venue: match.venue, city: match.city!, state: match.state!, attendance: match.attendance ?? 0 } : null
              return <BowlHeaderCard key={bowl.key} bowl={bowl} year={year} venue={venue} />
            })}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '0 0 16px' }}>
            Standings
          </h2>
          <SeasonDivisionStandings divisions={detail.divisions} />
        </section>

        {detail.allDivision && (
          <section>
            <AllDivisionTeams allDivision={detail.allDivision} />
          </section>
        )}

        <section>
          <SeasonBracket bracket={detail.championsBracket} year={year} title="Champions Bracket" />
        </section>

        <section>
          <SeasonBracket bracket={detail.consolationBracket} year={year} title="Consolation Bracket" />
        </section>

        <section>
          <SeasonAwardsGrid year={year} awardNames={detail.awardNames} awardDescriptions={detail.awardDescriptions} awardsTop5={detail.awardsTop5} awardsPartial={detail.awardsPartial} />
        </section>

      </div>
    </div>
  )
}
