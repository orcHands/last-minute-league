import { useMemo, useState } from 'react'
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { getSeasonPowerRanking } from '../data/league'
import type { SeasonManagerPowerSeries } from '../data/league'

function finalPoint(series: SeasonManagerPowerSeries) {
  return series.points[series.points.length - 1] ?? null
}

function RankingTooltip({ active, label, hoveredId, ranking }: any) {
  if (!active || !hoveredId || !ranking) return null
  const series = ranking.series.find((item: SeasonManagerPowerSeries) => item.managerId === hoveredId)
  const point = series?.points.find((item: { weekIndex: number }) => item.weekIndex === Number(label))
  const week = ranking.weeks.find((item: { weekIndex: number }) => item.weekIndex === Number(label))
  if (!series || !point || !week) return null

  return (
    <div style={{ backgroundColor: '#393939', border: '1px solid #525252', padding: '10px 14px', minWidth: 176 }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: series.color }}>
        {series.label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', marginTop: 2 }}>
        Week {week.week} · Rank #{point.rank}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#c6c6c6', marginTop: 8 }}>
        {point.wins}-{point.losses}{point.ties ? `-${point.ties}` : ''} all-play
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d' }}>
        {(point.winPct * 100).toFixed(1)}% win rate
      </div>
    </div>
  )
}

export default function SeasonPowerRankingChart({ year }: { year: number }) {
  const ranking = useMemo(() => getSeasonPowerRanking(year), [year])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (!ranking) return null

  const focusedId = selectedId ?? hoveredId
  const sortedSeries = [...ranking.series].sort(
    (a, b) => (finalPoint(a)?.rank ?? 999) - (finalPoint(b)?.rank ?? 999),
  )

  return (
    <div>
      <div style={{ backgroundColor: '#262626', border: '1px solid #393939', overflowX: 'auto' }}>
        <div style={{ minWidth: 720, padding: '20px 20px 8px' }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={ranking.rows} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#393939" horizontal={false} />
              <XAxis
                dataKey="weekIndex"
                tickFormatter={value => String(ranking.weeks[Number(value) - 1]?.week ?? '')}
                tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fill: '#8d8d8d' }}
                axisLine={{ stroke: '#393939' }}
                tickLine={false}
                label={{ value: 'WEEK', position: 'insideBottomRight', offset: -2, fill: '#6f6f6f', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}
              />
              <YAxis
                domain={[1, ranking.maxRank]}
                reversed
                allowDecimals={false}
                tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fill: '#8d8d8d' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<RankingTooltip hoveredId={focusedId} ranking={ranking} />} />
              {ranking.series.map(series => (
                <Line
                  key={series.managerId}
                  dataKey={series.managerId}
                  stroke={series.color}
                  strokeWidth={focusedId === series.managerId ? 4 : 2.5}
                  strokeOpacity={focusedId === null ? 0.72 : focusedId === series.managerId ? 1 : 0.12}
                  dot={false}
                  type="monotone"
                  isAnimationActive={false}
                  onMouseEnter={() => setHoveredId(series.managerId)}
                  onMouseLeave={() => setHoveredId(null)}
                  activeDot={{ r: 4, fill: series.color, stroke: '#161616', strokeWidth: 1 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {sortedSeries.map(series => {
          const point = finalPoint(series)
          const selected = selectedId === series.managerId
          const focused = focusedId === series.managerId
          return (
            <button
              key={series.managerId}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(selected ? null : series.managerId)}
              onMouseEnter={() => setHoveredId(series.managerId)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                backgroundColor: focused ? '#393939' : '#262626', border: `1px solid ${focused ? series.color : '#393939'}`,
                color: '#f4f4f4', cursor: 'pointer',
              }}
            >
              <span style={{ width: 10, height: 10, backgroundColor: series.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, lineHeight: '16px' }}>
                {series.label}
              </span>
              {point && (
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
                  #{point.rank}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
