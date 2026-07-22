import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'League History' },
  { to: '/seasons', label: 'Seasons' },
  { to: '/franchises', label: 'Franchises' },
  { to: '/players', label: 'Players' },
  { to: '/postseason', label: 'Post-season & Bowls' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/about', label: 'About' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
        backgroundColor: '#161616',
        borderBottom: '1px solid #393939',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      aria-label="Primary navigation"
    >
      <div
        style={{
          maxWidth: 1904,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'stretch',
          height: 48,
        }}
      >
        {/* Wordmark */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: '#f4f4f4',
            paddingRight: 32,
            borderRight: '1px solid #393939',
            flexShrink: 0,
          }}
        >
          <img
            src="/images/LMFL_Logo_transparent.png"
            alt="Last Minute Fantasy League"
            style={{ height: 32, width: 'auto', objectFit: 'contain', display: 'block' }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 400,
              fontSize: 11,
              color: '#8d8d8d',
              letterSpacing: '0.08em',
            }}
          >
            2013–
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            flex: 1,
            gap: 0,
            overflowX: 'auto',
          }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map(link => {
            const active = link.to === '/'
              ? pathname === '/'
              : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  textDecoration: 'none',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  color: active ? '#f4f4f4' : '#c6c6c6',
                  borderBottom: active ? '2px solid #f4f4f4' : '2px solid transparent',
                  transition: 'color 150ms cubic-bezier(0.2,0,0.38,0.9), border-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#f4f4f4'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#c6c6c6'
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#f4f4f4',
            padding: '0 16px',
            display: 'none',
            alignItems: 'center',
          }}
          className="show-mobile"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15.25 4.75 10 10l-5.25-5.25-.75.75L9.25 10l-5.25 5.25.75.75L10 10.75l5.25 5.25.75-.75L10.75 10l5.25-5.25-.75-.75z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 14.8h16V16H2zm0-5.4h16v1.2H2zm0-5.4h16V5.2H2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: '#262626',
            borderTop: '1px solid #393939',
          }}
        >
          {NAV_LINKS.map(link => {
            const active = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  textDecoration: 'none',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  color: active ? '#f4f4f4' : '#c6c6c6',
                  borderBottom: '1px solid #393939',
                  borderLeft: active ? '3px solid #f4f4f4' : '3px solid transparent',
                  paddingLeft: active ? 13 : 16,
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 671px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 672px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
