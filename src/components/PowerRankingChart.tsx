import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  FRANCHISE_POWER_SERIES, POWER_RANKING_ROWS, POWER_RANKING_MAX_RANK, POWER_RANKING_WEEKS,
} from '../data/league'
import type { FranchisePowerSeries, ManagerSegment } from '../data/league'

const GRADIENT_ID = (franchiseId: string) => `pr-grad-${franchiseId}`

/** Colour stops along a ribbon, one run per manager who owned the franchise.
 *  Each manager holds a solid colour across their own tenure, with a short
 *  blend band centred on each handover so the change reads as a transition
 *  rather than a hard seam. Offsets are objectBoundingBox units (0–1 across
 *  the ribbon's own span), which is exactly what `segments` already provides. */
function gradientStops(segments: ManagerSegment[]) {
  const BLEND = 0.02
  return segments.flatMap((seg, i) => {
    const length = seg.endFraction - seg.startFraction
    // Never eat more than 40% of a short tenure (Aboubacar's is ~8% of a span).
    const blend = Math.min(BLEND, length * 0.4)
    const from = i === 0 ? seg.startFraction : seg.startFraction + blend
    const to = i === segments.length - 1 ? seg.endFraction : seg.endFraction - blend
    return [
      { key: `${seg.managerId}-${i}-a`, offset: from, color: seg.color },
      { key: `${seg.managerId}-${i}-b`, offset: to, color: seg.color },
    ]
  })
}

/** Which manager held the franchise on a given week. */
function segmentAt(segments: ManagerSegment[], weekIndex: number): ManagerSegment | undefined {
  return (
    segments.find(s => weekIndex >= s.startWeekIndex && weekIndex <= s.endWeekIndex) ??
    segments[segments.length - 1]
  )
}

/** CSS equivalent of the ribbon gradient, for the legend swatch. */
function legendSwatch(series: FranchisePowerSeries): string {
  if (series.segments.length < 2) return series.color
  const stops = gradientStops(series.segments)
    .map(s => `${s.color} ${(s.offset * 100).toFixed(1)}%`)
    .join(', ')
  return `linear-gradient(90deg, ${stops})`
}

const SEASON_TICKS = (() => {
  const seen = new Set<number>()
  const ticks: { weekIndex: number; season: number }[] = []
  for (const w of POWER_RANKING_WEEKS) {
    if (!seen.has(w.season)) {
      seen.add(w.season)
      ticks.push({ weekIndex: w.weekIndex, season: w.season })
    }
  }
  return ticks
})()
const SEASON_TICK_INDICES = SEASON_TICKS.map(t => t.weekIndex)
const SEASON_BY_TICK = new Map(SEASON_TICKS.map(t => [t.weekIndex, t.season]))

function finalPoint(series: FranchisePowerSeries) {
  return series.points[series.points.length - 1] ?? null
}

function PowerTooltip({ active, payload, label, hoveredId }: any) {
  if (!active || !hoveredId || !payload) return null
  const entry = payload.find((p: any) => p.dataKey === hoveredId)
  if (!entry) return null
  const series = FRANCHISE_POWER_SERIES.find(s => s.franchiseId === hoveredId)
  const point = series?.points.find(p => p.weekIndex === label)
  const weekLabel = POWER_RANKING_WEEKS.find(w => w.weekIndex === label)
  if (!series || !point || !weekLabel) return null
  const segment = segmentAt(series.segments, point.weekIndex)

  return (
    <div
      style={{
        backgroundColor: '#393939',
        border: '1px solid #525252',
        padding: '10px 14px',
        fontFamily: "'IBM Plex Sans', sans-serif",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, color: segment?.color ?? series.color, marginBottom: 2 }}>
        {series.label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d', marginBottom: 8 }}>
        {weekLabel.season} · Week {weekLabel.week}
        {segment && series.segments.length > 1 && (
          <>
            {' · '}
            <span style={{ color: segment.color }}>{segment.name}</span>
          </>
        )}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#f4f4f4' }}>
        Rank #{point.rank}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c6c6c6', marginTop: 2 }}>
        {point.wins}-{point.losses}{point.ties > 0 ? `-${point.ties}` : ''} all-play
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d' }}>
        {(point.winPct * 100).toFixed(1)}% win rate
      </div>
    </div>
  )
}

function LegendChip({
  series, hovered, onEnter, onLeave,
}: {
  series: FranchisePowerSeries
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const point = finalPoint(series)
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        backgroundColor: hovered ? '#393939' : '#262626',
        border: `1px solid ${hovered ? series.color : '#393939'}`,
        cursor: 'default',
        transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
      }}
    >
      {/* Swatch mirrors the ribbon: a bar of every manager's colour in order
          for handed-down franchises, a plain dot for single-owner ones. */}
      <div
        style={{
          width: series.segments.length > 1 ? 22 : 10,
          height: 10,
          borderRadius: series.segments.length > 1 ? 2 : '50%',
          background: legendSwatch(series),
          flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, color: '#f4f4f4' }}>
        {series.label}
      </span>
      {point && (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d' }}>
          #{point.rank} · {point.wins}-{point.losses}{point.ties > 0 ? `-${point.ties}` : ''}
        </span>
      )}
      {series.retired && (
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6f6f6f' }}>
          retired {series.retiredAfterSeason}
        </span>
      )}
    </div>
  )
}

export default function PowerRankingChart() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const activeSeries = useMemo(
    () =>
      FRANCHISE_POWER_SERIES
        .filter(s => !s.retired)
        .sort((a, b) => (finalPoint(a)?.rank ?? 999) - (finalPoint(b)?.rank ?? 999)),
    [],
  )
  const retiredSeries = useMemo(
    () =>
      FRANCHISE_POWER_SERIES
        .filter(s => s.retired)
        .sort((a, b) => (finalPoint(a)?.rank ?? 999) - (finalPoint(b)?.rank ?? 999)),
    [],
  )

  return (
    <div>
      <div style={{ backgroundColor: '#262626', border: '1px solid #393939', padding: '20px 20px 8px' }}>
        <ResponsiveContainer width="100%" height={440}>
          <LineChart data={POWER_RANKING_ROWS} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <defs>
              {FRANCHISE_POWER_SERIES.map(s => (
                <linearGradient key={s.franchiseId} id={GRADIENT_ID(s.franchiseId)} x1="0" y1="0" x2="1" y2="0">
                  {gradientStops(s.segments).map(stop => (
                    <stop key={stop.key} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#393939" strokeDasharray="0" horizontal={false} />
            <XAxis
              dataKey="weekIndex"
              type="number"
              domain={[1, POWER_RANKING_ROWS.length]}
              ticks={SEASON_TICK_INDICES}
              tickFormatter={v => String(SEASON_BY_TICK.get(v) ?? '')}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={{ stroke: '#393939' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              domain={[1, POWER_RANKING_MAX_RANK]}
              reversed
              allowDecimals={false}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<PowerTooltip hoveredId={hoveredId} />} />
            {FRANCHISE_POWER_SERIES.map(s => (
              <Line
                key={s.franchiseId}
                dataKey={s.franchiseId}
                stroke={`url(#${GRADIENT_ID(s.franchiseId)})`}
                strokeWidth={hoveredId === s.franchiseId ? 4 : 2.5}
                strokeOpacity={hoveredId === null ? 0.7 : hoveredId === s.franchiseId ? 1 : 0.12}
                dot={false}
                type="monotone"
                isAnimationActive={false}
                connectNulls={false}
                onMouseEnter={() => setHoveredId(s.franchiseId)}
                onMouseLeave={() => setHoveredId(null)}
                activeDot={{ r: 4, fill: s.color, stroke: '#161616', strokeWidth: 1 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 11,
            color: '#8d8d8d',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Currently active
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {activeSeries.map(s => (
            <LegendChip
              key={s.franchiseId}
              series={s}
              hovered={hoveredId === s.franchiseId}
              onEnter={() => setHoveredId(s.franchiseId)}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>

        {retiredSeries.length > 0 && (
          <>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 11,
                color: '#8d8d8d',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Retired
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {retiredSeries.map(s => (
                <LegendChip
                  key={s.franchiseId}
                  series={s}
                  hovered={hoveredId === s.franchiseId}
                  onEnter={() => setHoveredId(s.franchiseId)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
