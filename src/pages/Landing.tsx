import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import H2HMatrix from '../components/H2HMatrix'
import AllTimeStandingsTable from '../components/AllTimeStandingsTable'
import PowerRankingChart from '../components/PowerRankingChart'
import ManagerSkillMatrix from '../components/ManagerSkillMatrix'
import StatBar from '../components/StatBar'
import { withBase } from '../lib/assetPath'

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
  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <section style={{ padding: '72px 16px 80px' }}>
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 12,
              color: '#8d8d8d',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Last Minute Football League · 2013–present
          </div>

          <img
            src={withBase('images/LML_13.png')}
            alt="Last Minute Football League 13 seasons"
            width={594}
            height={594}
            style={{
              display: 'block',
              width: 'clamp(260px, 38vw, 520px)',
              maxWidth: '100%',
              height: 'auto',
              margin: '0 0 48px',
            }}
          />

          {/* Dedication pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              backgroundColor: 'rgba(65, 182, 230, 0.10)',
              border: '1px solid #41B6E6',
              borderRadius: 999,
              padding: '14px 32px 14px 14px',
            }}
          >
            {/* Decorative — the sentence beside it already names him, so alt is empty. */}
            <img
              src={withBase('images/Brice.png')}
              alt=""
              width={56}
              height={56}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '24px',
                color: '#f4f4f4',
                margin: 0,
              }}
            >
              Dedicated to Brice Marino — commissioner, social nexus, legend.
            </p>
          </div>
        </div>
      </section>

      {/* ── League Stat Bar ── */}
      <section style={{ padding: '0 16px 64px', borderBottom: '1px solid #393939' }}>
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          <StatBar />
        </div>
      </section>

      {/* ── All-Time Standings ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          <SectionLabel>All-time standings</SectionLabel>
          <AllTimeStandingsTable />
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

      {/* ── Power Rankings ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          <SectionLabel>Power rankings</SectionLabel>
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
            Every franchise's cumulative all-play win rate, week by week, across all 208 weeks of
            league history. Rank 1 sits on top; a ribbon ends the moment a franchise retires.
          </p>
          <PowerRankingChart />
        </div>
      </section>

      {/* ── Manager Skill vs Roster Strength ── */}
      <section
        style={{
          padding: '64px 16px',
          borderBottom: '1px solid #393939',
        }}
      >
        <div style={{ maxWidth: PAGE.maxWidth, margin: '0 auto' }}>
          <SectionLabel>Manager skill vs roster strength</SectionLabel>
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
            Two independent axes, career-long. Roster strength is the average optimal lineup a
            manager's bench could have produced — pure draft-and-waiver talent. Manager skill is
            how much less that manager left on the bench than the league average — pure
            lineup-setting. Top-right is the dream: a stacked roster, started correctly every week.
          </p>
          <ManagerSkillMatrix />
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
                to: '/records',
                title: 'Records',
                desc: 'League record book, outliers, position whisperers, Hall of Fame, and the four bowls.',
                stat: '9 boards · 7 HOF classes',
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
