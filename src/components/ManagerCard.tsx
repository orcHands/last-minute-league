import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Manager } from '../data/league'
import AssetImage from './AssetImage'
import { withBase } from '../lib/assetPath'

interface ManagerCardProps {
  manager: Manager
  compact?: boolean
}

function Monogram({ name, color }: { name: string; color: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: 64,
        height: 64,
        backgroundColor: color + '22',
        border: `1px solid ${color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          fontSize: 20,
          color: color,
        }}
      >
        {initials}
      </span>
    </div>
  )
}

export default function ManagerCard({ manager, compact = false }: ManagerCardProps) {
  const [imgError, setImgError] = useState(false)

  const pct = manager.careerRecord.w / (manager.careerRecord.w + manager.careerRecord.l)
  const wpct = (pct * 100).toFixed(1)

  return (
    <Link
      to={`/franchises/${manager.franchiseId}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        style={{
          backgroundColor: '#262626',
          border: '1px solid #393939',
          borderTop: `3px solid ${manager.primaryColor}`,
          transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.backgroundColor = '#393939'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.backgroundColor = '#262626'
        }}
      >
        {/* Header: logo + name */}
        <div style={{ padding: compact ? '12px 16px' : '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {manager.logoLarge && !imgError ? (
            <img
              src={manager.logoLarge}
              alt={`${manager.name} — ${manager.teamName}`}
              width={compact ? 48 : 64}
              height={compact ? 48 : 64}
              style={{ objectFit: 'contain', flexShrink: 0 }}
              onError={() => setImgError(true)}
            />
          ) : (
            <Monogram name={manager.name} color={manager.primaryColor} />
          )}

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '22px',
                color: '#f4f4f4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {manager.teamName}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 400,
                fontSize: 12,
                lineHeight: '16px',
                color: '#8d8d8d',
              }}
            >
              {manager.name}
              {!manager.active && (
                <span style={{ marginLeft: 6, color: '#6f6f6f' }}>· retired</span>
              )}
            </div>
          </div>

          {manager.championships > 0 && (
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              {Array.from({ length: manager.championships }).map((_, i) => (
                <span key={i} style={{ fontSize: 14 }}>🏆</span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#393939' }} />

        {/* Stats */}
        <div
          style={{
            padding: compact ? '8px 16px' : '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
          }}
        >
          {[
            { label: 'Record', value: `${manager.careerRecord.w}–${manager.careerRecord.l}` },
            { label: 'Win%', value: wpct + '%' },
            { label: 'PF', value: manager.careerPF.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: '8px',
                borderRight: i < 2 ? '1px solid #393939' : undefined,
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: 11,
                  lineHeight: '16px',
                  color: '#8d8d8d',
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#f4f4f4',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Division badge + status */}
        {!compact && manager.division && (
          <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <AssetImage
              src={withBase(manager.division === 'oconner' ? 'images/BrianOConnerMemorialDivision_Logo.png' : 'images/TorettoFamilyDivision_logo.png')}
              alt=""
              size={16}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: manager.division === 'oconner' ? '#FF3B30' : '#006FFF',
                borderLeft: `2px solid ${manager.division === 'oconner' ? '#FF3B30' : '#006FFF'}`,
                paddingLeft: 6,
              }}
            >
              {manager.division === 'oconner' ? "Brian O'Conner Div." : 'Toretto Family Div.'}
            </span>
          </div>
        )}
      </article>
    </Link>
  )
}
