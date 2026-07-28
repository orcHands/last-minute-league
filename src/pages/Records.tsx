import { useState } from 'react'
import PostseasonBoard from './Postseason'
import {
  MondayNightMiracleBoard, PhaseBoard, BenchBoard, NemesisBoard,
  FandomBoard, RecruitingBoard, DefensesBoard,
} from './Leaderboards'

// Post-season & Bowls leads, then the seven named leaderboards. This page is
// the merge of the former /postseason and /leaderboards routes.
const BOARDS: { id: string; label: string; render: () => React.ReactNode }[] = [
  { id: 'postseason', label: 'Post-season & Bowls', render: () => <PostseasonBoard /> },
  { id: 'mnm', label: 'Monday Night Miracle', render: () => <MondayNightMiracleBoard /> },
  { id: 'phase', label: 'Drafter vs Closer', render: () => <PhaseBoard /> },
  { id: 'bench', label: 'Points Left on Bench', render: () => <BenchBoard /> },
  { id: 'nemesis', label: 'Nemesis & Rivalries', render: () => <NemesisBoard /> },
  { id: 'fandom', label: 'Fandom Scorecard', render: () => <FandomBoard /> },
  { id: 'recruiting', label: 'Recruiting Board', render: () => <RecruitingBoard /> },
  { id: 'defenses', label: 'NFL Defenses', render: () => <DefensesBoard /> },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: '#8d8d8d',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
    </div>
  )
}

export default function Records() {
  const [active, setActive] = useState(BOARDS[0].id)
  const current = BOARDS.find(b => b.id === active) ?? BOARDS[0]

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Records
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            Four named bowls and seven named boards. Real numbers, real stories.
          </p>
        </div>
      </div>

      <div className="records-layout" style={{ maxWidth: 1904, margin: '0 auto' }}>
        {/* Sidebar nav */}
        <div className="records-sidebar" style={{ borderRight: '1px solid #393939', padding: '24px 0' }}>
          {BOARDS.map(b => (
            <button
              key={b.id}
              onClick={() => setActive(b.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderLeft: `3px solid ${active === b.id ? '#f4f4f4' : 'transparent'}`,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: active === b.id ? 600 : 400,
                fontSize: 14,
                color: active === b.id ? '#f4f4f4' : '#c6c6c6',
                transition: 'all 150ms cubic-bezier(0.2,0,0.38,0.9)',
                paddingLeft: active === b.id ? 13 : 16,
              }}
              onMouseEnter={e => {
                if (active !== b.id) (e.currentTarget as HTMLElement).style.color = '#f4f4f4'
              }}
              onMouseLeave={e => {
                if (active !== b.id) (e.currentTarget as HTMLElement).style.color = '#c6c6c6'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Board content */}
        <div className="records-content" style={{ padding: '40px 32px 64px', minWidth: 0 }}>
          <SectionLabel>{current.label}</SectionLabel>
          {current.render()}
        </div>
      </div>

      <style>{`
        .records-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          min-height: calc(100vh - 130px);
        }
        .records-sidebar {
          border-right: 1px solid #393939;
        }
        @media (max-width: 671px) {
          .records-layout { grid-template-columns: 1fr; }
          .records-sidebar {
            border-right: none;
            border-bottom: 1px solid #393939;
            display: flex;
            overflow-x: auto;
            padding: 8px 0 !important;
          }
          .records-sidebar button {
            width: auto !important;
            white-space: nowrap;
            border-left: none !important;
            padding-left: 16px !important;
          }
          .records-content { padding: 24px 16px 48px !important; }
        }
      `}</style>
    </div>
  )
}
