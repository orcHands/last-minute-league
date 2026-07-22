import { MANAGERS, getH2H } from '../data/league'
import AssetImage from './AssetImage'

const CELL = 60
const HEADER = 168

function Avatar({ id, name, color, size }: { id: string; name: string; color: string; size: number }) {
  return (
    <AssetImage
      src={MANAGERS.find(m => m.id === id)?.logoSmall ?? ''}
      alt={name}
      size={size}
      fallback={
        <div
          style={{
            width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: color + '22', border: `1px solid ${color}44`, fontSize: size * 0.4,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color,
          }}
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
      }
    />
  )
}

export default function H2HMatrix() {
  return (
    <div style={{ overflow: 'auto', border: '1px solid #393939', maxHeight: 720 }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              style={{
                position: 'sticky', top: 0, left: 0, zIndex: 3,
                width: HEADER, minWidth: HEADER, backgroundColor: '#393939',
                borderBottom: '1px solid #525252', borderRight: '1px solid #525252',
              }}
            />
            {MANAGERS.map(col => (
              <th
                key={col.id}
                style={{
                  position: 'sticky', top: 0, zIndex: 2,
                  width: CELL, minWidth: CELL, backgroundColor: '#262626',
                  borderBottom: '1px solid #525252', padding: '8px 4px',
                  fontWeight: 400,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Avatar id={col.id} name={col.name} color={col.primaryColor} size={24} />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 9, color: '#8d8d8d',
                      writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 60, whiteSpace: 'nowrap',
                    }}
                  >
                    {col.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MANAGERS.map(row => (
            <tr key={row.id}>
              <th
                style={{
                  position: 'sticky', left: 0, zIndex: 1,
                  width: HEADER, minWidth: HEADER, backgroundColor: '#262626',
                  borderRight: '1px solid #525252', borderBottom: '1px solid #393939',
                  padding: '6px 12px', textAlign: 'left', fontWeight: 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar id={row.id} name={row.name} color={row.primaryColor} size={22} />
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#f4f4f4', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </span>
                </div>
              </th>
              {MANAGERS.map(col => {
                if (col.id === row.id) {
                  return (
                    <td
                      key={col.id}
                      style={{ width: CELL, minWidth: CELL, height: CELL, backgroundColor: '#1a1a1a', borderBottom: '1px solid #393939' }}
                    />
                  )
                }
                const record = getH2H(row.id, col.id)
                if (!record) {
                  return (
                    <td
                      key={col.id}
                      style={{ width: CELL, minWidth: CELL, height: CELL, backgroundColor: '#161616', borderBottom: '1px solid #393939' }}
                    />
                  )
                }
                const borderColor = record.w > record.l ? '#42be65' : record.w < record.l ? '#fa4d56' : '#8d8d8d'
                return (
                  <td
                    key={col.id}
                    style={{ width: CELL, minWidth: CELL, height: CELL, padding: 3, borderBottom: '1px solid #393939' }}
                  >
                    <div
                      style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${borderColor}`, backgroundColor: '#262626',
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {record.w}–{record.l}{record.t ? `-${record.t}` : ''}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
