export default function About() {
  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            About & Methodology
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            How the data works, what the asterisks mean, and who to blame.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 16px 80px' }}>
        {[
          {
            heading: '"Started Points" — the core metric',
            body: `Every scoring figure on this site measures Started Points: the total fantasy points scored by the
            players a manager actually put in their lineup that week. We do not include points from bench players,
            regardless of how obvious in hindsight the correct choice was. Started Points is the honest ledger of
            in-season decisions — it rewards knowing what you know, not what you'll know later.`,
          },
          {
            heading: 'Points Left on the Bench',
            body: `Bench Regret is the difference between a manager's actual lineup score and their theoretically
            optimal lineup, calculated retroactively each week. The league leaves an average of 16.4 pts per week
            on the bench. The all-time worst single week: pb in 2016 wk4, who started 76.4 of a possible 159.1 pts
            — leaving 82.7 on the bench. This is not judged. This is celebrated as part of the league's character.`,
          },
          {
            heading: 'Asterisk seasons',
            body: `Two seasons carry an asterisk: 2013 and 2020. 2013 was a half-season — the league launched at NFL
            week 7 and ran a shortened schedule. 2020 was the COVID "bubble" season: unique scheduling, different
            playoff formats, and circumstances that make direct comparison to full seasons misleading. Per-season
            stats for both years are tracked and displayed, but they are excluded from career and all-time baselines
            unless noted. The quirks are part of the record, not a reason to pretend they didn't happen.`,
          },
          {
            heading: 'Gate timeline — the Monday Night Miracle chart',
            body: `The gate timeline visualizes how a matchup's cumulative score evolved by scoring gate:
            Thursday night, Sunday early, Sunday afternoon, Sunday night, and Monday night. The stepped line
            shows exactly when each scoring surge happened. A "data gap" badge appears on games where gate-level
            data was unavailable (2020 bubble season, and 2024 wk17 due to a data export error).`,
          },
          {
            heading: 'Data provenance',
            body: `League history sourced from ESPN Fantasy API exports, manually verified against original
            weekly score sheets where discrepancies appeared. Player stats cross-referenced against NFL
            official game logs. Conference alignment uses current 2024–25 alignment: Texas is SEC, Cal and
            Stanford are ACC. The league ran on ESPN for the full 2013–present span.`,
          },
          {
            heading: 'Manager vs. franchise distinction',
            body: `A franchise is the ownership lineage of a team slot. A manager is an individual owner.
            Some franchises have had up to four managers (Free Agents: benedict → aboubacar → kat → alex).
            Career stats are always per-manager, never merged across franchise. Franchise all-time records
            accumulate across all managers who held that slot.`,
          },
          {
            heading: 'Credits',
            body: `Site built as a gift for Brice, the league's founding commissioner. Data: the league's
            shared spreadsheets, ESPN exports, and the kind of obsessive record-keeping that happens when
            you've been playing fantasy football together for thirteen years. If something is wrong, it's
            because the spreadsheet was wrong first.`,
          },
        ].map((section, i) => (
          <div key={section.heading} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#525252',
                  paddingTop: 4,
                  flexShrink: 0,
                  width: 24,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                0{i + 1}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: '22px',
                    color: '#f4f4f4',
                    margin: '0 0 12px',
                  }}
                >
                  {section.heading}
                </h2>
                <p
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '24px',
                    color: '#c6c6c6',
                    margin: 0,
                  }}
                >
                  {section.body}
                </p>
              </div>
            </div>
            {i < 6 && (
              <div style={{ height: 1, backgroundColor: '#393939', marginTop: 48 }} />
            )}
          </div>
        ))}

        {/* Design note */}
        <div style={{
          marginTop: 48,
          padding: '20px 24px',
          backgroundColor: '#262626',
          border: '1px solid #393939',
          borderLeft: '3px solid #8d8d8d',
        }}>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#8d8d8d' }}>
            <strong style={{ color: '#c6c6c6', fontFamily: "'IBM Plex Mono', monospace" }}>Design note:</strong>{' '}
            IBM Plex Sans for copy. IBM Plex Mono for every number. IBM Carbon Gray 100 dark theme.
            Square corners. Responsive from 320px mobile to 4K. The copy/data font split is intentional
            and load-bearing — it's how you know at a glance whether you're reading a fact or a judgment.
          </div>
        </div>
      </div>
    </div>
  )
}
