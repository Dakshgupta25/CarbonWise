export default function Navbar({ page, setPage, hasResult, modelType, setModelType }) {
  const links = [
    { id: 'home',        label: 'Calculate' },
    { id: 'dashboard',   label: 'Dashboard',   locked: !hasResult },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'badges',      label: 'Badges' },
  ]

  const isLR = modelType === 'lr'

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(10,15,10,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
    }}>

      {/* Logo */}
      <button onClick={() => setPage('home')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #166534, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(74,222,128,0.3)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C9 8 8 16 8 16c-2.18-1.43-2.8-4.13-2.8-4.13L3 14C4 18 8 20 8 20c2.56-3.62 5.5-7.9 9-12Z" fill="#0a0f0a"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Carbon<span style={{ color: 'var(--green)' }}>Wise</span>
        </span>
      </button>

      {/* Nav links — centre */}
      <div style={{ display: 'flex', gap: 2 }}>
        {links.map(l => (
          <button key={l.id}
            onClick={() => !l.locked && setPage(l.id)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13,
              fontWeight: 500, border: 'none',
              background: page === l.id ? 'var(--green-bg)' : 'none',
              color: l.locked ? 'var(--text3)' : page === l.id ? 'var(--green)' : 'var(--text2)',
              cursor: l.locked ? 'default' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
            {l.label}
            {l.locked && <span style={{ marginLeft: 4, fontSize: 10 }}>🔒</span>}
          </button>
        ))}
      </div>

      {/* RIGHT side — Model toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px 6px 14px',
        borderRadius: 99,
        border: '1px solid var(--border2)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        {/* Labels */}
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: !isLR ? 'var(--green)' : 'var(--text3)',
          fontWeight: !isLR ? 600 : 400,
          transition: 'color 0.2s',
          whiteSpace: 'nowrap',
        }}>
          Random Forest
        </span>

        {/* Toggle pill */}
        <button
          onClick={() => setModelType(isLR ? 'rf' : 'lr')}
          title={`Switch to ${isLR ? 'Random Forest' : 'Linear Regression'}`}
          style={{
            width: 44, height: 24, borderRadius: 99, border: 'none',
            background: isLR ? 'var(--blue)' : 'var(--green)',
            cursor: 'pointer', position: 'relative',
            transition: 'background 0.25s',
            flexShrink: 0,
            boxShadow: isLR ? '0 0 10px rgba(96,165,250,0.4)' : '0 0 10px rgba(74,222,128,0.4)',
          }}
        >
          <span style={{
            position: 'absolute', top: 3,
            left: isLR ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: '#0a0f0a',
            transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'block',
          }} />
        </button>

        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: isLR ? 'var(--blue)' : 'var(--text3)',
          fontWeight: isLR ? 600 : 400,
          transition: 'color 0.2s',
          whiteSpace: 'nowrap',
        }}>
          Linear Reg
        </span>
      </div>
    </nav>
  )
}
