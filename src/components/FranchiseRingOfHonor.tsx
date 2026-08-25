import { useId, useState } from 'react'
import AssetImage from './AssetImage'
import { getManager, type FranchiseRingOfHonorEntry } from '../data/league'

interface FranchiseRingOfHonorProps {
  currentManagerId: string
  entries: FranchiseRingOfHonorEntry[]
}

type RingCardStyle = React.CSSProperties & {
  '--roh-body': string
  '--roh-border': string
  '--roh-ink': string
}

type RingToggleStyle = React.CSSProperties & {
  '--ring-toggle-on': string
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return 0
  const channels = [0, 2, 4].map(offset => parseInt(normalized.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4)
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function paletteInk(background: string, secondary: string, tertiary: string): string {
  if (contrastRatio(tertiary, background) >= 4.5) return tertiary
  if (contrastRatio(secondary, background) >= 4.5) return secondary
  return contrastRatio('#161616', background) >= contrastRatio('#ffffff', background)
    ? '#161616'
    : '#ffffff'
}

function initials(player: string): string {
  return player
    .replace(' - DEF', '')
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

function PortraitPlaceholder({ entry }: { entry: FranchiseRingOfHonorEntry }) {
  return (
    <div className="ring-card__portrait-placeholder" aria-label={`${entry.player} portrait pending`}>
      <span aria-hidden="true">{initials(entry.player)}</span>
    </div>
  )
}

function RingCard({ entry }: { entry: FranchiseRingOfHonorEntry }) {
  const draftedBy = getManager(entry.draftedByManagerId)
  const primary = draftedBy?.primaryColor ?? '#8d8d8d'
  const secondary = draftedBy?.secondaryColor ?? '#161616'
  const tertiary = draftedBy?.tertiaryColor ?? '#525252'
  const style: RingCardStyle = {
    '--roh-body': primary,
    '--roh-border': secondary,
    '--roh-ink': paletteInk(primary, secondary, tertiary),
  }
  const drafter = draftedBy?.fullName ?? 'unknown manager'
  const hasNumberWord = entry.uniformNumber.length > 2

  return (
    <article
      className="ring-card"
      style={style}
      title={`Originally drafted by ${drafter}`}
      aria-label={`${entry.player}, number ${entry.uniformNumber}; originally drafted by ${drafter}`}
    >
      <div className="ring-card__topline">
        <div className={`ring-card__number${hasNumberWord ? ' ring-card__number--word' : ''}`}>
          {entry.uniformNumber}
        </div>
        <div className="ring-card__portrait">
          {entry.imagePath ? (
            <AssetImage
              src={entry.imagePath}
              alt={entry.player}
              width={69}
              height={50}
              style={{ width: 69, height: 50, objectFit: 'contain', objectPosition: 'center bottom' }}
              fallback={<PortraitPlaceholder entry={entry} />}
            />
          ) : (
            <PortraitPlaceholder entry={entry} />
          )}
        </div>
      </div>

      <h3>{entry.player.replace(' - DEF', ' D/ST')}</h3>

      {entry.gamesRostered !== null && (
        <div className="ring-card__stats ring-card__stats--single">
          <div>
            <span>Games Rostered</span>
            <strong>{entry.gamesRostered}</strong>
          </div>
        </div>
      )}
      {entry.gamesRostered === null && entry.franchiseStarts !== null && entry.ppg !== null && (
        <div className="ring-card__stats">
          <div>
            <span>Games Started</span>
            <strong>{entry.franchiseStarts}</strong>
          </div>
          <div>
            <span>PPG</span>
            <strong>{entry.ppg.toFixed(2)}</strong>
          </div>
        </div>
      )}
      {entry.gamesRostered === null && entry.careerGamesPlayed !== null && entry.ppg !== null && (
        <div className="ring-card__stats">
          <div>
            <span>Games Played</span>
            <strong>{entry.careerGamesPlayed}</strong>
          </div>
          <div>
            <span>PPG</span>
            <strong>{entry.ppg.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </article>
  )
}

export default function FranchiseRingOfHonor({ currentManagerId, entries }: FranchiseRingOfHonorProps) {
  const [isVisible, setIsVisible] = useState(true)
  const gridId = useId()
  const currentManager = getManager(currentManagerId)

  if (!currentManager) return null

  const toggleStyle: RingToggleStyle = {
    '--ring-toggle-on': currentManager.primaryColor,
  }

  return (
    <section className="franchise-ring" aria-labelledby="franchise-ring-title">
      <div className="franchise-ring__heading-row">
        <div>
          <h2 id="franchise-ring-title">{currentManager.fullName}’s Ring of Honor</h2>
          <p>Statistical standouts · franchise legends</p>
        </div>
        <div className="franchise-ring__toggle-field">
          <span className="franchise-ring__toggle-label">Show ring</span>
          <button
            type="button"
            role="switch"
            className="franchise-ring__toggle"
            style={toggleStyle}
            aria-checked={isVisible}
            aria-controls={gridId}
            aria-expanded={isVisible}
            aria-label={`${isVisible ? 'Hide' : 'Show'} ${currentManager.fullName}’s Ring of Honor`}
            onClick={() => setIsVisible(visible => !visible)}
          >
            <span className="franchise-ring__toggle-track" aria-hidden="true">
              <span className="franchise-ring__toggle-handle" />
            </span>
            <span className="franchise-ring__toggle-state" aria-hidden="true">
              {isVisible ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </div>

      <div id={gridId} hidden={!isVisible}>
        {entries.length > 0 ? (
          <div className="franchise-ring__grid">
            {entries.map(entry => <RingCard key={entry.id} entry={entry} />)}
          </div>
        ) : (
          <div className="franchise-ring__empty">No players inducted yet.</div>
        )}
      </div>

      <style>{`
        .franchise-ring {
          padding: 40px 8px 32px;
          overflow: hidden;
        }
        .franchise-ring__heading-row {
          min-height: 64px;
          margin: 0 0 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid #393939;
        }
        .franchise-ring__heading-row h2 {
          margin: 0;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 28px;
          line-height: 32px;
          font-weight: 400;
          color: #f4f4f4;
        }
        .franchise-ring__heading-row p {
          margin: 4px 0 16px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          color: #8d8d8d;
        }
        .franchise-ring__toggle-field {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .franchise-ring__toggle-label {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          font-weight: 400;
          color: #c6c6c6;
        }
        .franchise-ring__toggle {
          --ring-toggle-on: #42be65;
          min-width: 80px;
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          border: 0;
          background: transparent;
          color: #f4f4f4;
          cursor: pointer;
        }
        .franchise-ring__toggle-track {
          position: relative;
          width: 48px;
          height: 24px;
          flex: 0 0 48px;
          border-radius: 12px;
          background: #8d8d8d;
          transition: background-color 120ms cubic-bezier(.2, 0, .38, .9);
        }
        .franchise-ring__toggle-handle {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f4f4f4;
          transition: transform 120ms cubic-bezier(.2, 0, .38, .9);
        }
        .franchise-ring__toggle[aria-checked='true'] .franchise-ring__toggle-track {
          background: var(--ring-toggle-on);
        }
        .franchise-ring__toggle[aria-checked='true'] .franchise-ring__toggle-handle {
          transform: translateX(24px);
        }
        .franchise-ring__toggle-state {
          min-width: 24px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          line-height: 18px;
          font-weight: 400;
          text-align: left;
        }
        .franchise-ring__toggle:hover .franchise-ring__toggle-track { filter: brightness(.9); }
        .franchise-ring__toggle:focus-visible { outline: none; }
        .franchise-ring__toggle:focus-visible .franchise-ring__toggle-track {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        .franchise-ring__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, 152px);
          justify-content: start;
          gap: 12px;
        }
        .franchise-ring__empty {
          min-height: 112px;
          display: flex;
          align-items: center;
          border: 1px solid #393939;
          background: #1c1c1c;
          padding: 24px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          line-height: 18px;
          color: #8d8d8d;
        }
        .ring-card {
          --roh-body: #8d8d8d;
          --roh-border: #161616;
          --roh-ink: #161616;
          width: 152px;
          min-height: 166px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 2px solid var(--roh-border);
          border-radius: 10px;
          background: var(--roh-body);
          padding: 14px 14px 12px;
          color: var(--roh-ink);
        }
        .ring-card__topline {
          height: 50px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 69px;
          align-items: start;
          gap: 2px;
        }
        .ring-card__number {
          align-self: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 32px;
          line-height: 40px;
          font-weight: 600;
          letter-spacing: -.04em;
          font-variant-numeric: tabular-nums;
        }
        .ring-card__number--word {
          font-size: 16px;
          line-height: 20px;
          letter-spacing: 0;
        }
        .ring-card__portrait,
        .ring-card__portrait-placeholder {
          width: 69px;
          height: 50px;
        }
        .ring-card__portrait-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed color-mix(in srgb, var(--roh-ink) 42%, transparent);
          background: color-mix(in srgb, var(--roh-ink) 9%, transparent);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          line-height: 18px;
          font-weight: 600;
          letter-spacing: .04em;
        }
        .ring-card h3 {
          min-height: 40px;
          margin: 8px 0 6px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 16px;
          line-height: 20px;
          font-weight: 500;
          overflow-wrap: anywhere;
        }
        .ring-card__stats {
          margin-top: auto;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .ring-card__stats--single { grid-template-columns: minmax(0, 1fr); }
        .ring-card__stats > div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ring-card__stats span {
          overflow: hidden;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          white-space: nowrap;
          text-overflow: ellipsis;
          opacity: .56;
        }
        .ring-card__stats strong {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          line-height: 20px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 671px) {
          .franchise-ring { padding-left: 0; padding-right: 0; }
          .franchise-ring__heading-row { gap: 16px; }
          .franchise-ring__heading-row h2 { font-size: 20px; line-height: 28px; }
          .franchise-ring__grid { gap: 8px; }
        }
      `}</style>
    </section>
  )
}
