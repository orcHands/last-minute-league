import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MANAGER_SKILL_MATRIX } from '../data/league'
import type { ManagerSkillPoint } from '../data/league'

const { points, leagueAvgOptimal } = MANAGER_SKILL_MATRIX
const MAX_ABS_SKILL = Math.max(...points.map(p => Math.abs(p.skillDelta)))
const X_AXIS_PAD = MAX_ABS_SKILL * 1.15

const ROSTER_VALUES = points.map(p => p.avgOptimal)
const ROSTER_MIN = Math.min(...ROSTER_VALUES)
const ROSTER_MAX = Math.max(...ROSTER_VALUES)
const Y_AXIS_PAD = (ROSTER_MAX - ROSTER_MIN) * 0.15
const Y_DOMAIN: [number, number] = [ROSTER_MIN - Y_AXIS_PAD, ROSTER_MAX + Y_AXIS_PAD]

function AvatarShape(props: any) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ManagerSkillPoint }
  const [imgError, setImgError] = useState(false)
  const size = 32
  const r = size / 2

  if (payload.logoSmall && !imgError) {
    return (
      <g>
        <defs>
          <clipPath id={`skill-clip-${payload.managerId}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r + 2} fill="#161616" stroke={payload.color} strokeWidth={2} />
        <image
          href={payload.logoSmall}
          x={cx - r}
          y={cy - r}
          width={size}
          height={size}
          clipPath={`url(#skill-clip-${payload.managerId})`}
          preserveAspectRatio="xMidYMid slice"
          onError={() => setImgError(true)}
        />
      </g>
    )
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 2} fill={payload.color + '33'} stroke={payload.color} strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={10}
        fontWeight={600}
        fill={payload.color}
      >
        {payload.monogram}
      </text>
    </g>
  )
}

function SkillTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null
  const p: ManagerSkillPoint = payload[0].payload
  const managerGood = p.skillDelta >= 0
  const rosterGood = p.avgOptimal >= leagueAvgOptimal

  return (
    <div
      style={{
        backgroundColor: '#393939',
        border: '1px solid #525252',
        padding: '10px 14px',
        fontFamily: "'IBM Plex Sans', sans-serif",
        minWidth: 190,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, color: p.color, marginBottom: 6 }}>
        {p.label}
        {p.retired && <span style={{ marginLeft: 6, fontSize: 11, color: '#6f6f6f', fontWeight: 400 }}>· retired</span>}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: managerGood ? '#42be65' : '#fa4d56',
        }}
      >
        {managerGood ? 'Good manager' : 'Bad manager'} · {managerGood ? '+' : ''}{p.skillDelta.toFixed(1)} pts/wk vs avg
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: rosterGood ? '#42be65' : '#fa4d56',
          marginTop: 2,
        }}
      >
        {rosterGood ? 'Strong roster' : 'Weak roster'} · {p.avgOptimal.toFixed(1)} optimal pts/wk
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d', marginTop: 6 }}>
        {p.weeks} weeks tracked
      </div>
    </div>
  )
}

export default function ManagerSkillMatrix() {
  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', padding: '24px 24px 12px' }}>
      <ResponsiveContainer width="100%" height={480}>
        <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
          <XAxis
            type="number"
            dataKey="skillDelta"
            domain={[-X_AXIS_PAD, X_AXIS_PAD]}
            tickFormatter={v => v.toFixed(0)}
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
            axisLine={{ stroke: '#393939' }}
            tickLine={false}
            label={{
              value: '← Bad Manager · Good Manager →',
              position: 'insideBottom',
              offset: -12,
              fill: '#8d8d8d',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="avgOptimal"
            domain={Y_DOMAIN}
            tickFormatter={v => v.toFixed(0)}
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{
              value: '← Weak Roster · Strong Roster →',
              angle: -90,
              position: 'insideLeft',
              fill: '#8d8d8d',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 11,
            }}
          />
          <ReferenceLine x={0} stroke="#525252" />
          <ReferenceLine y={leagueAvgOptimal} stroke="#525252" strokeDasharray="4 4" />
          <Tooltip content={<SkillTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#525252' }} />
          <Scatter data={points} shape={(props: any) => <AvatarShape {...props} />} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
