import { Link } from 'react-router-dom'
import StatTile from '../components/StatTile'
import MatchupCard from '../components/MatchupCard'
import Badge from '../components/Badge'
import AssetImage from '../components/AssetImage'
import H2HMatrix from '../components/H2HMatrix'
import { SEASONS, MONDAY_NIGHT_MIRACLES, LEAGUE_STATS, getManager } from '../data/league'

const teremanaLogoPath = (year: number) => `/images/BowlGame_logos/TeremanaTequilaBowl_logos/TeremanaBowl_${year}.png`

const PAGE = {
  maxWidth: 1904,
  contentMax: 1584,
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: '#8d8d8d',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
    </div>
  )
}

export default function Landing() {
  const champions = SEASONS.map(s => ({
    ...s,
    manager: getManager(s.champion),
  })).filter(s => s.manager)

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <section
        style={{
          borderBottom: '1px solid #393939',
          padding: '80px 16px 96px',
        }}
      >
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 12,
              color: '#8d8d8d',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            2013 – present · {LEAGUE_STATS.seasons} seasons · {LEAGUE_STATS.managers} owners · {LEAGUE_STATS.franchises} franchises
          </div>

          {/* Hero title */}
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(42px, 6vw, 96px)',
              lineHeight: 1.05,
              color: '#f4f4f4',
              margin: '0 0 24px',
              letterSpacing: '-0.02em',
            }}
          >
            Last Minute
          </h1>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: 20,
              lineHeight: '28px',
              color: '#c6c6c6',
              maxWidth: 640,
              margin: '0 0 48px',
            }}
          >
            A fantasy football league, thirteen years of history, twenty-three owners,
            and approximately one comeback that defies probability every season.
          </p>

          {/* Dedication */}
          <div
            style={{
              display: 'inline-block',
              borderLeft: '3px solid #41B6E6',
              paddingLeft: 16,
            }}
          >
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#c6c6c6',
                margin: 0,
              }}
            >
              Dedicated to Brice — commissioner, rival, keeper of the spreadsheets.
            </p>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: '#8d8d8d',
                margin: '4px 0 0',
              }}
            >
              Miami Brice · Brian O'Conner Memorial Division
            </p>
          </div>
        </div>
      </section>

      {/* ── League Stats ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          <SectionLabel>League at a glance</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 1,
              backgroundColor: '#393939',
              border: '1px solid #393939',
            }}
          >
            <StatTile label="Avg pts / week" value={LEAGUE_STATS.avgPtsPerWeek.toFixed(1)} unit="pts" size="lg" />
            <StatTile
              label="Smallest margin ever"
              value={LEAGUE_STATS.smallestMarginEver.value.toFixed(2)}
              unit="pts"
              size="lg"
              accent="#f1c21b"
            />
            <StatTile
              label="Bench regret (avg)"
              value={LEAGUE_STATS.leagueAvgBenchRegret.toFixed(1)}
              unit="pts/wk"
              size="lg"
              accent="#fa4d56"
            />
            <StatTile
              label="Best MNF comeback"
              value={Math.abs(MONDAY_NIGHT_MIRACLES[0]?.deficitAtSundayNight ?? 0).toFixed(1)}
              unit="pts down"
              size="lg"
              accent="#24A148"
            />
          </div>
        </div>
      </section>

      {/* ── Champions Roll ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          <SectionLabel>Champions roll</SectionLabel>
          <div style={{ display: 'grid', gap: 1, backgroundColor: '#393939', border: '1px solid #393939' }}>
            {champions.map(s => {
              const mgr = s.manager!
              const pointsLeaderMgr = getManager(s.pointsLeader)
              return (
                <div
                  key={s.year}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 1fr auto',
                    alignItems: 'center',
                    backgroundColor: '#262626',
                    padding: '12px 16px',
                    gap: 16,
                    borderLeft: `3px solid ${mgr.primaryColor}`,
                    transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  {/* Year */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontWeight: 400,
                        fontSize: 16,
                        color: '#f4f4f4',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.year}
                    </span>
                  </div>

                  {/* Champion */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: 11,
                        color: '#8d8d8d',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        marginBottom: 2,
                      }}
                    >
                      Champion
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: mgr.primaryColor,
                      }}
                    >
                      {mgr.teamName}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: 12,
                        color: '#8d8d8d',
                      }}
                    >
                      {s.championTeam}
                    </div>
                  </div>

                  {/* Points leader */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: 11,
                        color: '#8d8d8d',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        marginBottom: 2,
                      }}
                    >
                      Letty Award (PF leader)
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        color: '#c6c6c6',
                      }}
                    >
                      {pointsLeaderMgr?.name ?? s.pointsLeader}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontWeight: 400,
                        fontSize: 12,
                        color: '#8d8d8d',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.pointsLeaderPF.toFixed(2)} pts
                    </div>
                  </div>

                  {/* Trophy indicator */}
                  <div style={{ flexShrink: 0 }}>
                    <AssetImage
                      src={teremanaLogoPath(s.year)}
                      alt={`Teremana Tequila Bowl ${s.year}`}
                      size={56}
                      fallback={<span style={{ fontSize: 20 }}>🏆</span>}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Head-to-Head ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          <SectionLabel>Head-to-head</SectionLabel>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 14,
              lineHeight: '20px',
              color: '#c6c6c6',
              maxWidth: 680,
              marginBottom: 32,
            }}
          >
            Every manager's all-time record against every other manager. Rows are the manager's own W–L
            (green border = leads the series, red = trails). Blank cells mean the two have never met.
          </p>
          <H2HMatrix />
        </div>
      </section>

      {/* ── Monday Night Miracle ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          <SectionLabel>The Monday Night Miracle</SectionLabel>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '24px',
              color: '#c6c6c6',
              maxWidth: 680,
              marginBottom: 40,
            }}
          >
            Every season, there's a game that shouldn't be winnable. Down 43.9 after Sunday night.
            Won by 0.04. Fantasy football distilled to its most absurd and glorious form.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 1,
              backgroundColor: '#393939',
            }}
          >
            {MONDAY_NIGHT_MIRACLES.map(m => (
              <MatchupCard key={m.id} miracle={m} />
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <Link
              to="/leaderboards"
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: '#78a9ff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              All Monday Night Miracles →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section Navigation ── */}
      <section style={{ padding: '64px 16px 80px' }}>
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          <SectionLabel>Explore the history</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 1,
              backgroundColor: '#393939',
              border: '1px solid #393939',
            }}
          >
            {[
              {
                to: '/seasons',
                title: 'Seasons',
                desc: '2013–2025. All 13 seasons, champions, brackets, weekly scores.',
                stat: '13 seasons',
              },
              {
                to: '/franchises',
                title: 'Franchises & Managers',
                desc: '15 franchises, 23 owners, 4 rings for The Dynasty.',
                stat: '15 franchises',
              },
              {
                to: '/postseason',
                title: 'Post-season & Bowls',
                desc: 'The Teremana Tequila Bowl, the Wing Bowl, the Tokyo Drift Bowl.',
                stat: '4 named bowls',
              },
              {
                to: '/leaderboards',
                title: 'Leaderboards & Records',
                desc: 'Phase splits, comeback records, bench regret, rivalries.',
                stat: '7 leaderboards',
              },
              {
                to: '/players',
                title: 'Players',
                desc: 'Travis Kelce with 2,612.76 started points. Positional leaders.',
                stat: '52 Bowl MVPs',
              },
              {
                to: '/about',
                title: 'About & Methodology',
                desc: '"Started Points", asterisk seasons, data provenance.',
                stat: null,
              },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    backgroundColor: '#262626',
                    padding: '24px',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: '22px',
                      color: '#f4f4f4',
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: '#8d8d8d',
                      marginBottom: item.stat ? 16 : 0,
                    }}
                  >
                    {item.desc}
                  </div>
                  {item.stat && (
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: '#78a9ff',
                      }}
                    >
                      {item.stat}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Asterisk seasons note ── */}
      <section
        style={{
          padding: '32px 16px 48px',
          borderTop: '1px solid #393939',
          backgroundColor: '#1a1a1a',
        }}
      >
        <div style={{ maxWidth: PAGE.contentMax, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <Badge type="asterisk" size="md" />
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13,
                lineHeight: '20px',
                color: '#8d8d8d',
                margin: 0,
                maxWidth: 640,
              }}
            >
              <strong style={{ color: '#c6c6c6' }}>Asterisk seasons:</strong> 2013 started NFL week 7 (half-season).
              2020 was the COVID "bubble" season with unique scheduling. Per-season averages for these seasons
              are tracked but not included in career baselines. They're weirder — and better — for it.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
