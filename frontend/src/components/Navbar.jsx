export default function Navbar({ onLogoClick }) {
  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <button
        onClick={onLogoClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--green-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C9 8 8 16 8 16c-2.18-1.43-2.8-4.13-2.8-4.13L3 14C4 18 8 20 8 20c2.56-3.62 5.5-7.9 9-12Z"
              fill="#C0DD97"/>
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.4px' }}>
          Carbon<span style={{ color: 'var(--green-600)' }}>Wise</span>
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 12, fontWeight: 500, padding: '4px 10px',
          background: 'var(--green-100)', color: 'var(--green-700)',
          borderRadius: 99,
        }}>
          AI-powered
        </span>
      </div>
    </nav>
  )
}
