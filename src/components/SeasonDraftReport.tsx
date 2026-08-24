import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DRAFT_POSITIONS, getDraftReport, getManager } from '../data/league'
import type { DraftPick, DraftPosition } from '../data/league'
import AssetImage from './AssetImage'

const POSITION_COLORS: Record<DraftPosition, string> = {
  QB: '#d98aae',
  RB: '#7fd8bd',
  WR: '#66c7e8',
  TE: '#ffb35c',
  DEF: '#be95ff',
  K: '#c6c6c6',
}

function pickKey(pick: DraftPick) {
  return `${pick.round}:${pick.managerId}`
}

function valueLabel(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
}

function PickCard({ pick }: { pick: DraftPick }) {
  return (
    <div style={{ backgroundColor: POSITION_COLORS[pick.position], color: '#161616', padding: '8px 10px', minHeight: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pick.player}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12, lineHeight: '16px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {pick.round}.{pick.pick}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', fontVariantNumeric: 'tabular-nums' }}>
        <span>{pick.position === 'DEF' ? 'D/ST' : pick.position}</span>
        <span>#{pick.overall} overall</span>
      </div>
    </div>
  )
}

function PositionPick({ label, pick }: { label: 'Best' | 'Worst'; pick: DraftPick }) {
  const manager = getManager(pick.managerId)
  return (
    <div style={{ padding: 16, backgroundColor: '#262626', borderTop: `3px solid ${label === 'Best' ? '#42be65' : '#fa4d56'}` }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label} {pick.position === 'DEF' ? 'D/ST' : pick.position} pick
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 16, lineHeight: '22px', color: '#f4f4f4', marginTop: 6 }}>
        {pick.player}
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: manager?.primaryColor ?? '#c6c6c6', marginTop: 2 }}>
        {manager?.name ?? pick.managerId}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
          Rd {pick.round} · #{pick.overall} overall
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: label === 'Best' ? '#42be65' : '#fa4d56', fontVariantNumeric: 'tabular-nums' }}>
          {valueLabel(pick.value)}
        </span>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {pick.startedPts.toFixed(2)} Started Points
      </div>
    </div>
  )
}

function DraftValueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((item: any) => Number(item.value) !== 0)
  return (
    <div style={{ backgroundColor: '#393939', border: '1px solid #525252', padding: '10px 14px', minWidth: 180 }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: '#f4f4f4', marginBottom: 8 }}>
        {label}
      </div>
      {rows.map((item: any) => (
        <div key={item.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '18px', color: item.fill }}>
          <span>{item.dataKey === 'DEF' ? 'D/ST' : item.dataKey}</span><span>{valueLabel(Number(item.value))}</span>
        </div>
      ))}
    </div>
  )
}

export default function SeasonDraftReport({ year }: { year: number }) {
  const report = getDraftReport(year)
  if (!report) return null

  const picksByCell = new Map<string, DraftPick[]>()
  for (const pick of report.picks) {
    const key = pickKey(pick)
    picksByCell.set(key, [...(picksByCell.get(key) ?? []), pick])
  }
  const boardWidth = 56 + report.managerOrder.length * 176
  const chartData = report.managerValues.map(row => ({
    ...row,
    manager: getManager(row.managerId)?.name ?? row.managerId,
  }))

  return (
    <div>
      <div>
        <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '0 0 4px' }}>
          Draft Report
        </h3>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', margin: '0 0 16px', maxWidth: 860 }}>
          Every pick, then the players who most beat—or missed—the Started Points expected from their position in the draft.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }} aria-label="Draft position colors">
        {DRAFT_POSITIONS.map(position => (
          <div key={position} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, backgroundColor: POSITION_COLORS[position] }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#c6c6c6' }}>
              {position === 'DEF' ? 'D/ST' : position}
            </span>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #393939', backgroundColor: '#161616' }} tabIndex={0} aria-label={`${year} full draft board; scroll horizontally to see every manager`}>
        <div style={{ minWidth: boardWidth }}>
          <div style={{ display: 'grid', gridTemplateColumns: `56px repeat(${report.managerOrder.length}, minmax(176px, 1fr))`, gap: 1, backgroundColor: '#393939' }}>
            <div style={{ position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#1c1c1c', padding: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d' }}>
              RD
            </div>
            {report.managerOrder.map(managerId => {
              const manager = getManager(managerId)
              return (
                <div key={managerId} style={{ minWidth: 0, backgroundColor: '#262626', borderTop: `3px solid ${manager?.primaryColor ?? '#8d8d8d'}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {manager && <AssetImage src={manager.logoSmall} alt="" size={24} fallback={<span style={{ width: 24, height: 24, backgroundColor: '#393939' }} />} />}
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: '#f4f4f4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {manager?.name ?? managerId}
                  </span>
                </div>
              )
            })}

            {Array.from({ length: report.rounds }, (_, index) => index + 1).flatMap(round => [
              <div key={`round-${round}`} style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#1c1c1c', padding: '12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#c6c6c6', fontVariantNumeric: 'tabular-nums' }}>
                {round}
              </div>,
              ...report.managerOrder.map(managerId => {
                const cellPicks = picksByCell.get(`${round}:${managerId}`) ?? []
                return (
                  <div key={`${round}-${managerId}`} style={{ minWidth: 0, backgroundColor: '#262626', padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cellPicks.length ? cellPicks.map(pick => <PickCard key={pick.overall} pick={pick} />) : <div style={{ minHeight: 64 }} />}
                  </div>
                )
              }),
            ])}
          </div>
        </div>
      </div>

      <h4 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '40px 0 16px' }}>
        Best and worst picks by position
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 12 }}>
        {DRAFT_POSITIONS.map(position => {
          const result = report.bestWorst[position]
          if (!result) return null
          return (
            <div key={position} style={{ border: '1px solid #393939', backgroundColor: '#393939' }}>
              <div style={{ padding: '10px 16px', backgroundColor: POSITION_COLORS[position], color: '#161616', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px' }}>
                {position === 'DEF' ? 'D/ST' : position}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1 }}>
                <PositionPick label="Best" pick={result.best} />
                <PositionPick label="Worst" pick={result.worst} />
              </div>
            </div>
          )
        })}
      </div>

      <h4 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '40px 0 4px' }}>
        Draft value by position
      </h4>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', margin: '0 0 16px' }}>
        Right of zero beat positional expectation; left of zero fell short. Values are Started Points.
      </p>
      <div style={{ backgroundColor: '#262626', border: '1px solid #393939', overflowX: 'auto' }}>
        <div style={{ minWidth: 760, padding: '16px 20px 8px' }}>
          <ResponsiveContainer width="100%" height={Math.max(420, chartData.length * 44)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 20 }}>
              <CartesianGrid stroke="#393939" horizontal={false} />
              <XAxis type="number" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fill: '#8d8d8d' }} axisLine={{ stroke: '#393939' }} tickLine={false} />
              <YAxis type="category" dataKey="manager" width={76} tick={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fill: '#c6c6c6' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DraftValueTooltip />} cursor={{ fill: '#2e2e2e' }} />
              {DRAFT_POSITIONS.map(position => (
                <Bar key={position} dataKey={position} stackId="draft-value" fill={POSITION_COLORS[position]} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', margin: '12px 0 0', maxWidth: 980 }}>
        Method: {report.methodology.scope} {report.methodology.value}
      </p>
    </div>
  )
}
