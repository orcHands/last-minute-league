interface StatTileProps {
  label: string
  value: string | number
  unit?: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  accent?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function StatTile({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  icon,
  accent,
  size = 'md',
}: StatTileProps) {
  const valueSize = size === 'lg' ? 42 : size === 'md' ? 28 : 20
  const valueLH = size === 'lg' ? '50px' : size === 'md' ? '36px' : '28px'

  return (
    <div
      style={{
        backgroundColor: '#262626',
        borderTop: accent ? `3px solid ${accent}` : '1px solid #393939',
        borderRight: '1px solid #393939',
        borderBottom: '1px solid #393939',
        borderLeft: accent ? `1px solid #393939` : '1px solid #393939',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#8d8d8d',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: accent ?? '#8d8d8d', flexShrink: 0 }}>{icon}</span>
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: size === 'lg' ? 300 : 400,
            fontSize: valueSize,
            lineHeight: valueLH,
            color: '#f4f4f4',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 14,
              color: '#8d8d8d',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 12,
              color: delta >= 0 ? '#42be65' : '#fa4d56',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
          </span>
          {deltaLabel && (
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 400,
                fontSize: 12,
                color: '#8d8d8d',
              }}
            >
              {deltaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
