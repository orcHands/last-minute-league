import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { MondayNightMiracle } from '../data/league'
import { getManager } from '../data/league'
import Badge from './Badge'

interface MatchupCardProps {
  miracle: MondayNightMiracle
}

export default function MatchupCard({ miracle }: MatchupCardProps) {
  const winner = getManager(miracle.winner)
  const loser = getManager(miracle.loser)
  if (!winner || !loser) return null

  const homeColor = winner.primaryColor
  const awayColor = loser.primaryColor

  const hasGap = miracle.gateTimeline.length === 0

  return (
    <div
      style={{
        backgroundColor: '#262626',
        border: '1px solid #393939',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: 6,
        }}
      >
        <div style={{ flex: 1, backgroundColor: homeColor }} />
        <div style={{ flex: 1, backgroundColor: awayColor }} />
      </div>

      {/* Match context */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #393939',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            color: '#8d8d8d',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          {miracle.season} · Week {miracle.week}
        </span>
        <Badge type="win" label={`Won by ${miracle.margin.toFixed(2)}`} />
      </div>

      {/* Competitors + score */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '16px',
          gap: 16,
        }}
      >
        {/* Winner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              color: '#8d8d8d',
              letterSpacing: '0.08em',
            }}
          >
            Winner
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: homeColor,
            }}
          >
            {winner.teamName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 28,
              color: '#f4f4f4',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {miracle.winnerFinal.toFixed(2)}
          </span>
        </div>

        {/* VS */}
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
            color: '#525252',
          }}
        >
          vs
        </span>

        {/* Loser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              color: '#8d8d8d',
              letterSpacing: '0.08em',
            }}
          >
            Defeated
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: awayColor,
            }}
          >
            {loser.teamName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 28,
              color: '#c6c6c6',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {miracle.loserFinal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Deficit callout */}
      <div
        style={{
          margin: '0 16px',
          padding: '10px 12px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #393939',
          borderLeft: `3px solid ${homeColor}`,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12,
            color: '#c6c6c6',
          }}
        >
          Trailed by{' '}
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#fa4d56',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.abs(miracle.deficitAtSundayNight).toFixed(1)}
          </span>{' '}
          after Sunday Night Football
        </span>
      </div>

      {/* Gate timeline chart */}
      {hasGap ? (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Badge type="data-gap" label="Gate data unavailable" />
        </div>
      ) : (
        <div style={{ padding: '0 0 16px' }}>
          <div style={{ padding: '0 16px 8px' }}>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 11,
                color: '#8d8d8d',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
              }}
            >
              Cumulative points by gate
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={miracle.gateTimeline}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                stroke="#393939"
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="gate"
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fill: '#8d8d8d',
                }}
                axisLine={{ stroke: '#393939' }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fill: '#8d8d8d',
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#393939',
                  border: '1px solid #525252',
                  borderRadius: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#f4f4f4',
                }}
                labelStyle={{ color: '#c6c6c6', marginBottom: 4 }}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : String(value),
                  name === 'home' ? winner.name : loser.name,
                ]}
              />
              <Line
                type="stepAfter"
                dataKey="home"
                stroke={homeColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: homeColor }}
              />
              <Line
                type="stepAfter"
                dataKey="away"
                stroke={awayColor}
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 3, fill: awayColor }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ padding: '0 16px', display: 'flex', gap: 16 }}>
            {[
              { color: homeColor, label: winner.name, dashed: false },
              { color: awayColor, label: loser.name, dashed: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 2,
                    backgroundColor: item.color,
                    borderBottom: item.dashed ? `2px dashed ${item.color}` : undefined,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 11,
                    color: '#8d8d8d',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #393939',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13,
          lineHeight: '18px',
          color: '#c6c6c6',
          fontStyle: 'italic',
        }}
      >
        "{miracle.description}"
      </div>
    </div>
  )
}
