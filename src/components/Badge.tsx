interface BadgeProps {
  type: 'asterisk' | 'data-gap' | 'win' | 'loss' | 'champion' | 'info'
  label?: string
  size?: 'sm' | 'md'
}

const BADGE_STYLES = {
  asterisk: { bg: '#422700', text: '#f1c21b', border: '#f1c21b40' },
  'data-gap': { bg: '#2d3d52', text: '#78a9ff', border: '#78a9ff40' },
  win:        { bg: '#022D0D', text: '#42be65', border: '#42be6540' },
  loss:       { bg: '#2d0709', text: '#fa4d56', border: '#fa4d5640' },
  champion:   { bg: '#3A2C00', text: '#f1c21b', border: '#f1c21b60' },
  info:       { bg: '#001d3d', text: '#4589ff', border: '#4589ff40' },
}

const BADGE_LABELS = {
  asterisk: '* asterisk season',
  'data-gap': '⚠ data gap',
  win: 'W',
  loss: 'L',
  champion: '🏆 Champion',
  info: 'info',
}

export default function Badge({ type, label, size = 'sm' }: BadgeProps) {
  const style = BADGE_STYLES[type]
  const displayLabel = label ?? BADGE_LABELS[type]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 600,
        fontSize: size === 'sm' ? 11 : 12,
        lineHeight: size === 'sm' ? '16px' : '18px',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {displayLabel}
    </span>
  )
}
