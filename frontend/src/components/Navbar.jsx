export default function Navbar({ page, setPage, hasResult }) {
  const links = [
    { id: 'home',        label: 'Calculate' },
    { id: 'dashboard',   label: 'Dashboard',   locked: !hasResult },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'badges',      label: 'Badges' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(10,15,10,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <button onClick={() => setPage('home')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer',
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

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {links.map(l => (
          <button key={l.id}
            onClick={() => !l.locked && setPage(l.id)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--r-sm)', fontSize: 13,
              fontWeight: 500, border: 'none',
              background: page === l.id ? 'var(--green-bg)' : 'none',
              color: l.locked ? 'var(--text3)' : page === l.id ? 'var(--green)' : 'var(--text2)',
              cursor: l.locked ? 'default' : 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.1px',
            }}>
            {l.label}
            {l.locked && <span style={{ marginLeft: 4, fontSize: 10 }}>🔒</span>}
          </button>
        ))}
      </div>

      {/* Badge pill */}
      <div style={{
        padding: '5px 12px', borderRadius: 99,
        border: '1px solid rgba(74,222,128,0.25)',
        background: 'var(--green-bg)',
        fontSize: 11, fontFamily: 'var(--font-mono)',
        color: 'var(--green)', letterSpacing: '0.5px',
      }}>
        AI · RF MODEL
      </div>
    </nav>
  )
}
