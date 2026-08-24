import { getSeasonDetail, SEASON_DETAIL_YEARS } from '../data/league'
import BowlHeaderCard from './BowlHeaderCard'
import SeasonDivisionStandings from './SeasonDivisionStandings'
import SeasonBracket from './SeasonBracket'
import SeasonAwardsGrid from './SeasonAwardsGrid'
import AllDivisionTeams from './AllDivisionTeams'
import SeasonPowerRankingChart from './SeasonPowerRankingChart'
import SeasonDraftReport from './SeasonDraftReport'

/**
 * The full season breakdown, with NO page chrome of its own -- no background,
 * no <h1>, no breadcrumb. Round 5: Hoss wants picking a season on /seasons to
 * open the detail UNDER that page's header rather than navigating away to a
 * separate page, so this had to become embeddable. Seasons.tsx renders it
 * directly beneath the season grid; the /seasons/:year route now also renders
 * Seasons.tsx (with the year preselected) so deep links and the back button
 * still work.
 */
export default function SeasonDetailBody({ year }: { year: number }) {
  const detail = getSeasonDetail(year)

  if (!detail) {
    return (
      <div style={{ border: '1px solid #393939', backgroundColor: '#262626', padding: 24, marginTop: 32 }}>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#8d8d8d', margin: 0 }}>
          Full bowl brackets, standings, and season awards aren't built for {year} yet — currently {SEASON_DETAIL_YEARS.join(', ') || 'none'}.
        </p>
      </div>
    )
  }

  // venue for named-bowl cards -- pull from whichever bracket's terminal entry matches this bowl
  const allTerminal = [...detail.championsBracket.rounds, ...detail.consolationBracket.rounds]
    .flatMap(r => r.entries)
    .filter(e => e.kind === 'game' && e.terminal)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, marginTop: 32 }}>

        <section>
          <div className="season-bowl-grid" style={{ display: 'grid', gap: 16, alignItems: 'stretch' }}>
            {detail.bowls.map(bowl => {
              const match = allTerminal.find(e =>
                (e.m1 === bowl.winnerManager && e.m2 === bowl.loserManager) ||
                (e.m2 === bowl.winnerManager && e.m1 === bowl.loserManager)
              )
              const venue = match?.venue ? { venue: match.venue, city: match.city!, state: match.state!, attendance: match.attendance ?? 0 } : null
              return <BowlHeaderCard key={bowl.key} bowl={bowl} year={year} venue={venue} />
            })}
          </div>
          <style>{`
            .season-bowl-grid { grid-template-columns: minmax(0, 1fr); }
            @media (min-width: 672px) {
              .season-bowl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (min-width: 1056px) {
              .season-bowl-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            }
          `}</style>
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
          <SeasonBracket bracket={detail.championsBracket} year={year} title="Champions Bracket" accent="#f1c21b" />
        </section>

        <section>
          <SeasonBracket bracket={detail.consolationBracket} year={year} title="Consolation Bracket" accent="#8d8d8d" />
        </section>

        <section>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '0 0 4px' }}>
            Weekly Power Ranking
          </h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', margin: '0 0 16px' }}>
            Cumulative all-play rank resets in Week 1. Select a manager to isolate their season.
          </p>
          <SeasonPowerRankingChart year={year} />
        </section>

        <section>
          <SeasonAwardsGrid year={year} awardNames={detail.awardNames} awardDescriptions={detail.awardDescriptions} awardsTop5={detail.awardsTop5} awardsPartial={detail.awardsPartial} />
        </section>

        <section>
          <SeasonDraftReport year={year} />
        </section>

    </div>
  )
}
